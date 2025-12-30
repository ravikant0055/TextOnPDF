import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { useDrop, useDrag } from 'react-dnd'
import { PDFDocument, rgb } from 'pdf-lib'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

const ITEM_TYPE = 'TEXT_ITEM'

const PDFCanvas = ({ onDownloadReady, onReset }) => {
    const [fileUrl, setFileUrl] = useState(null)
    const [originalFile, setOriginalFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [droppedTexts, setDroppedTexts] = useState([])
    const [scrollPosition, setScrollPosition] = useState({ scrollTop: 0, scrollLeft: 0 })
    const [pageRects, setPageRects] = useState([])

    const pdfContainerRef = useRef(null)
    const viewerRef = useRef(null)
    const defaultLayoutPluginInstance = defaultLayoutPlugin()

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') {
            setLoading(true)
            setOriginalFile(file)
            setFileUrl(URL.createObjectURL(file))
            setDroppedTexts([]) 
        }
    }

    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl)
        }
    }, [fileUrl])

    useEffect(() => {
        const handleScroll = () => {
            if (pdfContainerRef.current) {
                const scrollContainer = pdfContainerRef.current.querySelector('.rpv-core__viewer')
                if (scrollContainer) {
                    const newScrollPos = {
                        scrollTop: scrollContainer.scrollTop,
                        scrollLeft: scrollContainer.scrollLeft
                    }
                    setScrollPosition(newScrollPos)
                }
            }
        }

        const container = pdfContainerRef.current
        if (container) {
            const scrollContainer = container.querySelector('.rpv-core__viewer')
            if (scrollContainer) {
                let rafId = null
                const optimizedScroll = () => {
                    if (rafId) cancelAnimationFrame(rafId)
                    rafId = requestAnimationFrame(handleScroll)
                }
                
                scrollContainer.addEventListener('scroll', optimizedScroll, { passive: true })
                handleScroll()
                return () => {
                    scrollContainer.removeEventListener('scroll', optimizedScroll)
                    if (rafId) cancelAnimationFrame(rafId)
                }
            }
        }
    }, [fileUrl])

    useEffect(() => {
        if (!fileUrl) return

        let rafId = null
        let lastUpdateTime = 0
        const throttleDelay = 200 
        
        const updatePageRects = () => {
            const now = Date.now()
            if (now - lastUpdateTime < throttleDelay && rafId) {
                return 
            }
            lastUpdateTime = now
            
            if (rafId) cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
                if (!pdfContainerRef.current) return
                
                const viewer = pdfContainerRef.current.querySelector('.rpv-core__viewer')
                if (!viewer) return
                
                const pages = pdfContainerRef.current.querySelectorAll('.rpv-core__page-layer')
                if (pages.length === 0) return
                
                const viewerRect = viewer.getBoundingClientRect()
                
                const rects = Array.from(pages).map((page, index) => {
                    const rect = page.getBoundingClientRect()
                    return {
                        pageIndex: index,
                        top: rect.top - viewerRect.top + viewer.scrollTop,
                        left: rect.left - viewerRect.left + viewer.scrollLeft,
                        width: rect.width,
                        height: rect.height
                    }
                })
                setPageRects(rects)
            })
        }

        const timeout = setTimeout(updatePageRects, 1000)
        const interval = setInterval(updatePageRects, 5000) 
        
        const viewer = pdfContainerRef.current?.querySelector('.rpv-core__viewer')
        if (viewer) {
            viewer.addEventListener('scroll', updatePageRects, { passive: true })
        }
        
        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
            if (rafId) cancelAnimationFrame(rafId)
            if (viewer) {
                viewer.removeEventListener('scroll', updatePageRects)
            }
        }
    }, [fileUrl])

    const findPageForPoint = (x, y) => {
        for (let i = 0; i < pageRects.length; i++) {
            const rect = pageRects[i]
            if (x >= rect.left && x <= rect.left + rect.width &&
                y >= rect.top && y <= rect.top + rect.height) {
                return {
                    pageIndex: i,
                    pageX: x - rect.left,
                    pageY: y - rect.top,
                    pageWidth: rect.width,
                    pageHeight: rect.height
                }
            }
        }
        return null
    }

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TEXT_ITEM',
        canDrop: () => true, 
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset()
            if (!pdfContainerRef.current || !offset) {
                return
            }
            const droppedText = item?.text
            
            if (!droppedText) {
                console.warn('No text found in dropped item:', item)
                return
            }

            const containerRect = pdfContainerRef.current.getBoundingClientRect()
            const screenX = offset.x - containerRect.left
            const screenY = offset.y - containerRect.top

            const pages = pdfContainerRef.current.querySelectorAll('.rpv-core__page-layer')
            let pageInfo = null
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i]
                const pageRect = page.getBoundingClientRect()
                if (offset.x >= pageRect.left && offset.x <= pageRect.right &&
                    offset.y >= pageRect.top && offset.y <= pageRect.bottom) {
                    const pageX = offset.x - pageRect.left
                    const pageY = offset.y - pageRect.top
                    pageInfo = {
                        pageIndex: i,
                        pageX,
                        pageY,
                        pageWidth: pageRect.width,
                        pageHeight: pageRect.height
                    }
                    break
                }
            }

            if (!pageInfo) {
                const viewer = pdfContainerRef.current.querySelector('.rpv-core__viewer')
                if (viewer && pageRects.length > 0) {
                    const viewerRect = viewer.getBoundingClientRect()
                    const scrollTop = viewer.scrollTop
                    const scrollLeft = viewer.scrollLeft
                    const x = offset.x - viewerRect.left + scrollLeft
                    const y = offset.y - viewerRect.top + scrollTop
                    pageInfo = findPageForPoint(x, y)
                }
                
                if (!pageInfo) {
                    if (pages.length > 0) {
                        const firstPage = pages[0]
                        const firstPageRect = firstPage.getBoundingClientRect()
                        pageInfo = {
                            pageIndex: 0,
                            pageX: offset.x - firstPageRect.left,
                            pageY: offset.y - firstPageRect.top,
                            pageWidth: firstPageRect.width,
                            pageHeight: firstPageRect.height
                        }
                    } else {
                        pageInfo = {
                            pageIndex: 0,
                            pageX: 0,
                            pageY: 0,
                            pageWidth: 100,
                            pageHeight: 100
                        }
                    }
                }
            }

            const newTextItem = {
                text: droppedText, 
                x: screenX, 
                y: screenY,  
                pageIndex: pageInfo.pageIndex,
                pageX: pageInfo.pageX,
                pageY: pageInfo.pageY,
                pageWidth: pageInfo.pageWidth,
                pageHeight: pageInfo.pageHeight
            }

            if (item?.index !== undefined) {
                setDroppedTexts((prev) =>
                    prev.map((t, i) => 
                        i === item.index ? newTextItem : t
                    )
                )
            } else {
                setDroppedTexts((prev) => [...prev, newTextItem])
                if (item?.onDelete) {
                    item.onDelete()
                }
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }))

    const handleDownload = useCallback(() => {
        if (!originalFile || droppedTexts.length === 0) {
            alert('Please add some text to the PDF before downloading')
            return
        }

        if (loading) return 

        setLoading(true)
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(async () => {
                    try {
            
          
            const fileArrayBuffer = await originalFile.arrayBuffer()
            await new Promise(resolve => setTimeout(resolve, 50))
            
            const pdfDoc = await PDFDocument.load(fileArrayBuffer)
            await new Promise(resolve => setTimeout(resolve, 50))
            
            const pages = pdfDoc.getPages()

           
            const batchSize = 5
            for (let i = 0; i < droppedTexts.length; i += batchSize) {
                for (let j = i; j < Math.min(i + batchSize, droppedTexts.length); j++) {
                    const textItem = droppedTexts[j]
                    const page = pages[textItem.pageIndex]
                    if (!page) continue

                    const { width: pageWidth, height: pageHeight } = page.getSize()
                    
                    const pdfX = (textItem.pageX / textItem.pageWidth) * pageWidth
                    const pdfY = pageHeight - ((textItem.pageY / textItem.pageHeight) * pageHeight)

                    page.drawText(textItem.text, {
                        x: pdfX,
                        y: pdfY,
                        size: 12,
                        color: rgb(0, 0, 1),
                    })
                }
                
                await new Promise(resolve => setTimeout(resolve, 10))
            }

            await new Promise(resolve => setTimeout(resolve, 300))
            
            const pdfBytes = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const bytes = await pdfDoc.save()
                        resolve(bytes)
                    } catch (error) {
                        reject(error)
                    }
                }, 50)
            })
            
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = originalFile.name.replace('.pdf', '_annotated.pdf')
            document.body.appendChild(link)
            link.click()
            
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link)
                }
                URL.revokeObjectURL(url)
                setLoading(false)
            }, 300)
                
                    } catch (error) {
                        console.error('Error downloading PDF:', error)
                        alert('Error downloading PDF. Please try again.')
                        setLoading(false)
                    }
                }, 200) 
            })
        })
    }, [originalFile, droppedTexts, loading])

    useEffect(() => {
        if (onDownloadReady) {
            onDownloadReady(handleDownload)
        }
    }, [onDownloadReady, handleDownload])

    useEffect(() => {
        if (onReset) {
            const resetHandler = () => {
                setFileUrl(null)
                setOriginalFile(null)
                setDroppedTexts([])
                setLoading(false)
            }
            onReset(resetHandler)
        }
    }, [onReset])

    return (
        <div className="flex flex-col justify-center px-25 py-5 w-full h-full">
            <div
                ref={(node) => {
                    pdfContainerRef.current = node
                    drop(node)
                }}
                className={`relative flex items-center justify-center bg-white w-full rounded-2xl shadow-xl border border-black/10 h-full overflow-hidden ${isOver ? 'ring-2 ring-blue-500' : ''}`}
                style={{ pointerEvents: 'auto' }}
            >
                {loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                        <div className="bg-white p-6 rounded-lg shadow-xl">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                <p className="text-lg font-semibold">Processing PDF...</p>
                                <p className="text-sm text-gray-600">Please wait, this may take a moment</p>
                            </div>
                        </div>
                    </div>
                )}

                {fileUrl ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div ref={viewerRef} className="w-full h-full">
                        <Viewer
                            fileUrl={fileUrl}
                            plugins={[defaultLayoutPluginInstance]}
                            onDocumentLoad={() => {
                                setLoading(false)
                                setTimeout(() => {
                                    const scrollContainer = pdfContainerRef.current?.querySelector('.rpv-core__viewer')
                                    if (scrollContainer) {
                                        setScrollPosition({
                                            scrollTop: scrollContainer.scrollTop,
                                            scrollLeft: scrollContainer.scrollLeft
                                        })
                                        scrollContainer.dispatchEvent(new Event('scroll'))
                                    }
                                }, 500)
                            }}
                            />
                        </div>
                    </Worker>
                ) : (
                    <div className="text-center">
                        <input type="file" accept="application/pdf" onChange={handleFileChange} className='text-sm font-semibold cursor-pointer' />
                    </div>
                )}

                {droppedTexts.map((item, index) => (
                    <DraggableText 
                        key={index} 
                        item={item} 
                        index={index}
                        scrollPosition={scrollPosition}
                        containerRef={pdfContainerRef}
                    />
                ))}
            </div>
        </div>
    )
}

const DraggableText = ({ item, index, scrollPosition, containerRef }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TEXT_ITEM',
        item: { ...item, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    const textElementRef = useRef(null)
    const [displayPosition, setDisplayPosition] = useState({ x: item.x, y: item.y })

    useEffect(() => {
        if (!containerRef?.current) return

        const container = containerRef.current
        
        const updatePosition = () => {
            const pages = container.querySelectorAll('.rpv-core__page-layer')
            if (pages.length === 0 || !pages[item.pageIndex]) {
                return
            }

            const page = pages[item.pageIndex]
            
            if (page && item.pageX !== undefined && item.pageY !== undefined && item.pageWidth && item.pageHeight) {
                const pageRect = page.getBoundingClientRect()
                const containerRect = container.getBoundingClientRect()
                
                const scaleX = pageRect.width / item.pageWidth
                const scaleY = pageRect.height / item.pageHeight
                
                const x = (pageRect.left - containerRect.left) + (item.pageX * scaleX)
                const y = (pageRect.top - containerRect.top) + (item.pageY * scaleY)
                
                if (textElementRef.current) {
                    textElementRef.current.style.left = `${x}px`
                    textElementRef.current.style.top = `${y}px`
                }
                setDisplayPosition({ x, y })
            }
        }

        updatePosition()
        const initialTimeout = setTimeout(updatePosition, 300)

        const findViewer = () => {
            return container.querySelector('.rpv-core__viewer') ||
                   container.querySelector('[class*="viewer"]') ||
                   container.querySelector('.rpv-core__inner')
        }
        
        const viewer = findViewer()
        
        if (viewer) {
            viewer.addEventListener('scroll', updatePosition, { passive: true })
            
            window.addEventListener('scroll', updatePosition, { passive: true, capture: true })
            
            const intervalId = setInterval(updatePosition, 100)
            
            const resizeObserver = new ResizeObserver(updatePosition)
            resizeObserver.observe(viewer)
            
            return () => {
                clearTimeout(initialTimeout)
                clearInterval(intervalId)
                viewer.removeEventListener('scroll', updatePosition)
                window.removeEventListener('scroll', updatePosition, { capture: true })
                resizeObserver.disconnect()
            }
        } else {
            clearTimeout(initialTimeout)
            const intervalId = setInterval(updatePosition, 200)
            return () => {
                clearInterval(intervalId)
            }
        }
    }, [scrollPosition, item.pageIndex, item.pageX, item.pageY, item.pageWidth, item.pageHeight, item.x, item.y, containerRef])


    const combinedRef = (node) => {
        textElementRef.current = node
        drag(node)
    }

    return (
        <div
            ref={combinedRef}
            style={{
                position: 'absolute',
                left: displayPosition.x,
                top: displayPosition.y,
                cursor: 'move',
                color: 'blue',
                fontWeight: 'bold',
                opacity: isDragging ? 0.5 : 1,
                pointerEvents: 'auto',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '2px 4px',
                borderRadius: '2px',
            }}
        >
            {item.text}
        </div>
    )
}

export default PDFCanvas;
