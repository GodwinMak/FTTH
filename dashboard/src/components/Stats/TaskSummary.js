import React from 'react'
// import {empolyeesData} from "../../constants"
import Card from './Card'
import BarChart from './BarChart'

const TaskSummary = ({darkMode, datum, data}) => {

  return (
    <div 
    className='flex flex-col md:flex-row gap-5'
    // className='grid grid-cols-3 gap-2'
    >
      <div className='flex flex-col gap-4 h-full'>
        {
            datum.map((data, index)=>(
                <Card key={index} data={data}/>
            ))
        }
      </div>
      <BarChart darkMode={darkMode}  data={data}/>
    </div>
  )
}

export default TaskSummary