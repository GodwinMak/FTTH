import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stats from "./components/Stats";
import PendingTask from "./components/Task/PendingTask";
import PendingApproval from "./components/Task/PendingApproval";
import TaskForm from "./components/Task/TaskFrom";
import User from "./components/User/User";
import CreateContractor from "./components/User/CreateContractor";
import CreateUser from "./components/User/CreateUser";
import Contractor from "./components/User/Contractor";
import ContractorReport from "./components/Task/ContractorReport";
import ApproveTask from "./components/Task/AproveTask";
import Ont from "./components/Stock/AssignStock";
import Task from "./components/Task/Task";
import Completion from "./components/Report/Completion";
import RejectedTask from "./components/Task/RejectedTask";
import StockTransfer from "./components/Stock/StockTransfer";
import StockTransferReport from "./components/Stock/StockTransferReport";
import StockUsageReport from "./components/Stock/StockUsageReport";
import PrivateRoute from "./PrivateRoute";
import { Navigate } from "react-router-dom";
import ContractorStats from "./components/ContractorStats";
import ContractorTask from "./components/ContractorTask";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("userData"));


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getDefaultDashboardPath = () => {
    if (!user) return "/";
    if (user.user_type === "admin" || user.user_type === "contractor") {
      return "stats"; // route to Stats
    }
    if (user.user_type === "admin_contractor") {
      return "contractor-stats"; // route to Completion
    }
    return "stats"; // fallback
  };
  return (
    <>
      <>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Protected Dashboard */}
            <Route element={<PrivateRoute />}>
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                  />
                }
              >
                {/* redirect base dashboard path */}
                <Route
                  index
                  element={<Navigate to={`/dashboard/${getDefaultDashboardPath()}`} replace />}
                />

                {/* start visible by admin and support */}
                <Route path="stats" element={<Stats darkMode={darkMode} />} />
                <Route path="pendingtask" element={<PendingTask />} />
                <Route path="rejected" element={<RejectedTask />} />
                <Route path="pendingapproval" element={<PendingApproval />} />
                <Route path="taskform" element={<TaskForm />} />
                <Route path="contractorreport" element={<ContractorReport />} />
                <Route path="approvetask" element={<ApproveTask />} />
                <Route path="taskview" element={<Task />} />
                {/* end visible by admin and support */}

                {/* visible by admin only */}
                <Route path="user" element={<User />} />
                <Route path="contractor" element={<Contractor />} />
                <Route path="createuser" element={<CreateUser />} />
                <Route path="createcontractor" element={<CreateContractor />} />
                <Route path="assign-stock" element={<Ont />} />
                <Route path="stock-transfer" element={<StockTransfer />} />
                <Route
                  path="stock-transfer-report"
                  element={<StockTransferReport />}
                />
                <Route
                  path="stock-usage-report/:id"
                  element={<StockUsageReport />}
                />
                {/* end visible by admin only */}

                {/* visible by admin and admin_contractor */}
                <Route path="completion-report" element={<Completion />} />
                {/* end visible by admin and admin_contractor */}

                {/* Visilbe by admin_contractor */}
                <Route path="contractor-stats" element={<ContractorStats/>}/>
                <Route path="contractor-tasks" element={<ContractorTask/>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </>
    </>
  );
};

export default App;
