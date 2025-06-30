import React, {useState, useEffect} from 'react'
import Main from "./Main"
import DonutChart from './DonutChart'
import Content from "./Content"
import TaskSummary from './TaskSummary'
import {PRODUCTION_URL} from "../../utils/Api"
import axios from "axios"
import {
  IoIosStats,
  IoIosSettings,
  IoIosPerson,
  IoIosPersonAdd,
  IoIosEyeOff,
  IoIosLogIn,
  IoIosLogOut,
} from "react-icons/io";

const Stats = ({darkMode}) => {
    const[ data, setData] = useState([])


    useEffect(()=>{
      const fetchData = async () =>{
        try {
          await axios.get(`${PRODUCTION_URL}/stats`)
          .then((response) => {
            setData(response.data);
          })
        } catch (error) {
            console.log(error)
        }
      }
      fetchData();
    }, [])


    const datum = [
      {
        title: "New Installations",
        icon: IoIosPerson,
        count: data.inProgressNewInstallations,
        bgColor: "bg-gray-100",
      },
      {
        title: "Escalation",
        icon: IoIosEyeOff,
        count: data.inProgressTroubleshooting,
        bgColor: "bg-blue-100",
      },
      {
        title: "Pending Approvals",
        icon: IoIosPersonAdd,
        count: data.completedTasksInprogress,
        bgColor: "bg-yellow-100",
      },
    ];

  return (
    <Main>
        <Content>
            <TaskSummary darkMode={darkMode} datum={datum} data={data}/>

            {/* <div className='flex flex-col gap-3 lg:flex-row'></div> */}
        </Content>
        <DonutChart darkMode={darkMode} className="order-first" data={data}/>
    </Main>
  )
}

export default Stats