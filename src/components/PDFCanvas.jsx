import React, { useState, useEffect, useRef } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { useDrop, useDrag } from 'react-dnd'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

const ITEM_TYPE = 'TEXT_ITEM'

const PDFCanvas = () => {
    const [fileUrl, setFileUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [droppedTexts, setDroppedTexts] = useState([])

    const pdfContainerRef = useRef(null)
    const defaultLayoutPluginInstance = defaultLayoutPlugin()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') {
            setLoading(true)
            setFileUrl(URL.createObjectURL(file))
        }
    }

    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl)
        }
    }, [fileUrl])

    // Drop target for PDF container
    const [, drop] = useDrop(() => ({
        accept: 'TEXT_ITEM',
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset()
            if (!pdfContainerRef.current || !offset) return

            const rect = pdfContainerRef.current.getBoundingClientRect()
            const x = offset.x - rect.left
            const y = offset.y - rect.top

            if (item.index !== undefined) {
                // Reposition internal dropped text
                setDroppedTexts((prev) =>
                    prev.map((t, i) => (i === item.index ? { ...t, x, y } : t))
                )
            } else {
                // New text from list
                setDroppedTexts((prev) => [...prev, { text: item.text, x, y }])
                if (item.onDelete) item.onDelete()
            }
        },
    }))

    return (
        <div className="flex justify-center px-25 py-5 w-full">
            <div
                ref={(node) => {
                    pdfContainerRef.current = node
                    drop(node)
                }}
                className="relative flex items-center justify-center bg-white w-full rounded-2xl shadow-xl border border-black/10 h-full"
            >
                {loading && (
                    <div className="absolute top-2 left-2 right-2">
                        <progress className="w-full" />
                    </div>
                )}

                {fileUrl ? (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                            fileUrl={fileUrl}
                            plugins={[defaultLayoutPluginInstance]}
                            onDocumentLoad={() => setLoading(false)}
                        />
                    </Worker>
                ) : (
                    <div className="p-5 text-center">
                        <input type="file" accept="application/pdf" onChange={handleFileChange} />
                    </div>
                )}

                {/* Render draggable texts */}
                {droppedTexts.map((item, index) => (
                    <DraggableText key={index} item={item} index={index} />
                ))}
            </div>
        </div>
    )
}

// Simple draggable component
const DraggableText = ({ item, index }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TEXT_ITEM',
        item: { ...item, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <div
            ref={drag}
            style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                cursor: 'move',
                color: 'blue',
                fontWeight: 'bold',
                opacity: isDragging ? 0.5 : 1,
                pointerEvents: 'auto',
            }}
        >
            {item.text}
        </div>
    )
}

export default PDFCanvas;

