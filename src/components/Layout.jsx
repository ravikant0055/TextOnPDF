import React from 'react'
import PDFCanvas from './PDFCanvas';
import InputArea from './InputArea';

const Layout = () => {
  return (
    <div className='flex p-5 h-screen'>
        <div className='flex w-full gap-2'>
            <PDFCanvas/>
            <div className="flex items-center">
                <div className="h-[80%] w-px bg-linear-to-t from-transparent via-[#000000] to-transparent"></div>
            </div>
            <InputArea/>
        </div>
    </div>
  )
}

export default Layout;
