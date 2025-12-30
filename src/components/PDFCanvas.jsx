import React, { useState, useEffect } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

const PDFCanvas = () => {
  const [fileUrl, setFileUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setLoading(true)
      setFileUrl(URL.createObjectURL(file))
    }
  }

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  return (
    <div className="flex justify-center px-25 py-5 w-full">
      <div className="relative flex items-center justify-center bg-white w-full rounded-2xl shadow-xl border border-black/10">

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
      </div>
    </div>
  )
}

export default PDFCanvas
