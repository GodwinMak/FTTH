import React,{useState} from 'react'
import Header from './Header'
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
const Dashboard = ({darkMode,toggleDarkMode}) => {
  console.log(darkMode)

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
        console.log("hello")
    }
  return (
    <div className={`${darkMode && "dark"} `}>
        <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} toggleSidebar={toggleSidebar}/>
        <div className=''>
        <Sidebar isSidebarOpen={isSidebarOpen}/>
        <Outlet />
        </div>
        
    </div>
  )
}

export default Dashboard