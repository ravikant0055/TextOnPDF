import React, { useState } from 'react'
import { MdOutlineDeleteForever } from "react-icons/md";

const InputArea = () => {
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

  return (
    <div className="flex flex-col justify-between items-start w-full py-5 px-10">
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
            <div key={index} className='flex items-center gap-2'>
              <div className="shadow px-2 py-1 rounded-md border w-full border-black/5 cursor-pointer">
                <h1>{text}</h1>
              </div>
            <MdOutlineDeleteForever onClick={() => handleDelete(index)} className='text-red-500 text-2xl cursor-pointer'/>
             </div>
          ))}
        </div>

      </div>

      <button className="bg-blue-500 hover:bg-blue-600 px-8 py-1 rounded-md text-white cursor-pointer">
        Save and Next
      </button>
    </div>
  )
}

export default InputArea
