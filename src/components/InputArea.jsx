import React, { useState, useRef, useEffect } from 'react'
import { MdOutlineDeleteForever } from "react-icons/md";
import { useDrag } from 'react-dnd'

const ITEM_TYPE = 'TEXT_ITEM'

const DraggableItem = ({ text, onDelete, index }) => {
  const textRef = useRef(text)
  useEffect(() => {
    textRef.current = text
  }, [text])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { text: textRef.current, onDelete }, 
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [onDelete])

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="shadow px-2 py-1 rounded-md border w-full border-black/5 cursor-pointer">
        <h1>{text}</h1>
      </div>
      <MdOutlineDeleteForever onClick={onDelete} className='text-red-500 text-2xl cursor-pointer'/>
    </div>
  )
}

const InputArea = ({ onSaveAndNext, downloadFunction, resetFunction, isSaved }) => {
  const [inputValue, setInputValue] = useState('')
  const [textList, setTextList] = useState([])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      setTextList((prev) => [...prev, inputValue.trim()])
      setInputValue('')
    }
  }

  const handleDelete = (indexToDelete) => {
    setTextList((prev) => prev.filter((_, index) => index !== indexToDelete))
  }

  const handleSaveAndNext = () => {
    if (onSaveAndNext) {
      onSaveAndNext()
    }
  }

  const handleDownload = () => {
    if (downloadFunction) {
      downloadFunction()
    }
  }

  const handleReset = () => {
    setInputValue('')
    setTextList([])
    if (resetFunction) {
      resetFunction()
    }
  }

  return (
    <div className="flex flex-col justify-between items-start w-full py-5 px-10">
      {!isSaved ? (
        <>
          <div className="flex flex-col gap-5 w-full">
            {/* Input */}
            <input
              placeholder="Input text...."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border px-2 py-1 border-black/40 rounded-md outline-none
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
            />

            {/* List */}
            <div
              className="flex flex-col gap-2 p-2"
              style={{ maxHeight: '400px', overflowY: 'auto' }}
            >
              {textList.map((text, index) => (
                <DraggableItem
                  key={`${text}-${index}`}
                  text={text}
                  index={index}
                  onDelete={() => handleDelete(index)}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleSaveAndNext}
            className="bg-blue-500 hover:bg-blue-600 px-8 py-1 rounded-md text-white cursor-pointer"
          >
            Save and Next
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full items-center justify-center h-full">
          <button 
            onClick={handleDownload}
            disabled={!downloadFunction}
            className="group relative bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed px-8 py-3 rounded-lg text-white font-semibold cursor-pointer w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </span>
          </button>
          <button 
            onClick={handleReset}
            className="group relative bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-3 rounded-lg text-white font-semibold cursor-pointer w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default InputArea
