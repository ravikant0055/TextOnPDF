import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import PDFCanvas from './PDFCanvas'
import InputArea from './InputArea'

const Layout = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex p-5 h-screen'>
        <div className='flex w-full gap-2'>
          <PDFCanvas/>
          <div className="flex items-center">
            <div className="h-[80%] w-px bg-linear-to-t from-transparent via-[#000000] to-transparent"></div>
          </div>
          <InputArea/>
        </div>
      </div>
    </DndProvider>
  )
}

export default Layout
