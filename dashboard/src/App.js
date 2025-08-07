import React, {useState} from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Stats from './components/Stats'
import PendingTask from './components/Task/PendingTask'
import PendingApproval from './components/Task/PendingApproval'
import TaskForm from './components/Task/TaskFrom'
import User from './components/User/User'
import CreateContractor from './components/User/CreateContractor'
import CreateUser from './components/User/CreateUser'
import Contractor from './components/User/Contractor'
import ContractorReport from './components/Task/ContractorReport'
import ApproveTask from './components/Task/AproveTask'
import Ont from './components/Stock/AssignStock'
import Task from "./components/Task/Task"
import Completion from './components/Report/Completion'
import {AuthProvider} from "./Context/AuthContext"
import { TaskProvider } from './Context/TaskContext'
import RejectedTask from './components/Task/RejectedTask'
import StockTransfer from './components/Stock/StockTransfer'
import StockTransferReport from './components/Stock/StockTransferReport'
import StockUsageReport from './components/Stock/StockUsageReport'

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {  
        setDarkMode(!darkMode)
  }
  return (
    <AuthProvider>
      <TaskProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/dashboard' element={<Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>}>
            <Route path=''element={<Stats  darkMode={darkMode}/>}/>
            <Route path='pendingtask' element={<PendingTask />}/>
            <Route path='rejected' element={<RejectedTask />}/>
            <Route path='pendingapproval' element={<PendingApproval/>}/>
            <Route path='taskform' element={<TaskForm />}/>
            <Route path='user' element={<User/>}/>
            <Route path='contractor' element={<Contractor/>}/>
            <Route path='createuser' element={<CreateUser/>}/>
            <Route path='createcontractor' element={<CreateContractor/>}/>
            <Route path='contractorreport' element={<ContractorReport/>}/>
            <Route path='approvetask' element={<ApproveTask/>}/>
            <Route path='assign-stock' element={<Ont/>}/>
            <Route path="stock-transfer" element={<StockTransfer/>} />
            <Route path='stock-transfer-report' element={<StockTransferReport/>}/>
            {/* <Route path='stock-usage-report' element={<StockUsageReport/>}/> */}
            <Route path="stock-usage-report/:id" element={<StockUsageReport />} />
            <Route path='completion-report'   element={<Completion/>}/>
            <Route path="taskview" element={<Task/>}/>

          </Route>
        </Routes>
      </Router>
      </TaskProvider>
      
    </AuthProvider>
  )
}

export default App