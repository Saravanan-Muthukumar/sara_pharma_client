import React, { useState } from 'react'

export default function FeedBackPage() {

  const [list, setList] = useState([]);
  const [input, setInput] = useState('');

  const handleInput = () =>{
    console.log(input)
    if (input.trim() === '') return;

    setList([...list, input]);
    console.log("list", list)
    setInput('')
  }

  const handleClear = () =>{
    setList([])
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      <div className='flex flex-col w-80 gap-4 bg-white p-6 rounded-xl shadow-md'>

      
      <h1 className='text-2xl font-bold text-gray-600 text-center'>Todo List</h1>
      <input className='border border-gray-300 rounded-md p-1 focus-:outline-none focus:ring-2 focus:ring-blue-400'
      type="text" value={input} onChange={(e)=>setInput(e.target.value)} placeholder = "Enter Item" />
      <button className='bg-blue-500 rounded-lg py-2 text-white hover:bg-blue-600 transition' 
      onClick={handleInput}>Add</button>
      <ul className='space-y-2'>
        {list.map((item, index)=>(
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button className='border border-red-500 rounded-lg text-red-500 py-2 hover:bg-red-500 hover:text-white transition' 
      onClick={handleClear}>Clear List</button>

      </div>

    </div>
  )
}

