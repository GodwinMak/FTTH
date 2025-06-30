import React from 'react'
import Title from '../ui/Title'
import {FiSend} from 'react-icons/fi'
import ChartSummary from './ChartSummary'

const BarChart = ({darkMode, data}) => {
  return (
    <div className='bg-white p-5 rounded-2xl dark:bg-gray-600 dark:text-gray-300 flex-1'>
        <div className='flex justify-between items-center'>
            <Title>Complete Monthly Task</Title>
            <FiSend className='bg-gray-500 p-2 rounded-full text-gray-300 w-8 h-8'/>
        </div>
        <div>
            <h1 className='font-bold text-2xl'>30 <span className='font-medium text-xl'>New Installation</span></h1>
            <span>On May 2024</span>
        </div>
        <ChartSummary darkMode={darkMode} data={data}/>
    </div>
  )
}

export default BarChart






