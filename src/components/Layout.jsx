import React, { useState, useRef, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import PDFCanvas from './PDFCanvas'
import InputArea from './InputArea'

const Layout = () => {
  const [isSaved, setIsSaved] = useState(false)
  const [showPDF, setShowPDF] = useState(true)
  const [downloadFunction, setDownloadFunction] = useState(null)
  const resetFunctionRef = useRef(null)

  const handleSaveAndNext = () => {
    setIsSaved(true)
  }

  const handleDownloadReady = useCallback((downloadFn) => {
    setDownloadFunction(() => downloadFn)
  }, [])

  const handleResetReady = (resetFn) => {
    resetFunctionRef.current = resetFn
  }

  const handleReset = () => {
    setIsSaved(false)
    setShowPDF(false)
    if (resetFunctionRef.current) {
      resetFunctionRef.current()
    }
    setTimeout(() => {
      setShowPDF(true)
    }, 100)
  }

  const handleDownload = () => {
    if (downloadFunction) {
      downloadFunction()
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex p-5 h-screen'>
        <div className='flex w-full gap-2'>
          {showPDF && <PDFCanvas onDownloadReady={handleDownloadReady} onReset={handleResetReady} />}
          {showPDF && (
            <div className="flex items-center">
              <div className="h-[80%] w-px bg-linear-to-t from-transparent via-[#000000] to-transparent"></div>
            </div>
          )}
          <InputArea 
            onSaveAndNext={handleSaveAndNext}
            downloadFunction={handleDownload}
            resetFunction={handleReset}
            isSaved={isSaved}
          />
        </div>
      </div>
    </DndProvider>
  )
}

export default Layout
