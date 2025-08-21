import React, { useEffect, useState } from "react";
import LinkItem from "./LinkItem";
import { Link } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaChartBar, FaUsersCog, FaListAlt } from "react-icons/fa";
import { BiTask } from "react-icons/bi";
import { MdPendingActions } from "react-icons/md";
import { BsRouterFill } from "react-icons/bs";
import { PRODUCTION_URL } from "../../utils/Api";
import { GiStopSign } from "react-icons/gi";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

import axios from "axios";

const Sidebar = ({ isSidebarOpen }) => {
  const [stats, setStats] = useState({});
  const user = JSON.parse(localStorage.getItem("userData"));
  const userRole = user?.user_type;
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    dispatch({ type: "SIGN_OUT" });
    navigate("/");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${PRODUCTION_URL}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchData();
  }, []);

  const links = [
    {
      href: "/dashboard",
      icon: FaChartBar,
      text: "Dashboard",
      allowedRoles: ["admin", "support"],
    },
    {
      href: "/dashboard/pendingtask",
      icon: BiTask,
      text: "Tasks",
      badge: {
        text: stats.inProgress || "0",
        color: "bg-gray-100 text-gray-800",
        darkColor: "dark:bg-gray-700 dark:text-gray-300",
      },
      allowedRoles: ["admin", "support"],
    },
    // {
    //   href: "/dashboard/rejected",
    //   icon: GiStopSign,
    //   text: "Rejected Tasks",
    //   badge: {
    //     text: stats.rejected || "0",
    //     color: "bg-gray-100 text-gray-800",
    //     darkColor: "dark:bg-gray-700 dark:text-gray-300",
    //   },
    //   allowedRoles: ["admin", "support"],
    // },
    {
      href: "/dashboard/pendingapproval",
      icon: MdPendingActions,
      text: "Pending Approvals",
      badge: {
        text: stats.completedTasksInprogress || "0",
        color: "bg-blue-100 text-blue-800",
        darkColor: "dark:bg-blue-900 dark:text-blue-300",
      },
      allowedRoles: ["admin", "support"],
    },
    {
      href: "#",
      icon: BsRouterFill,
      text: "Stock",
      dropdown: ["Assign Stock", "Stock Transfer", "Stock Transfer Report"],
      allowedRoles: ["admin"],
    },
    {
      href: "#",
      icon: FaUsersCog,
      text: "Users",
      dropdown: ["User", "Contractor"],
      allowedRoles: ["admin"],
    },
    {
      href: "/dashboard/contractor-stats",
      icon: FaChartBar,
      text: "Dashboard",
      allowedRoles: ["admin_contractor"]
    },
    {
      href: "contractor-tasks",
      icon: BiTask,
      text: "Tasks",
      allowedRoles: ["admin_contractor"]
    },
    {
      href: "#",
      icon: FaListAlt,
      text: "Reports",
      dropdown: ["Completion Report"],
      allowedRoles: ["admin", "admin_contractor"],
    },
  ];

  return (
    <>
      <aside
        className={`fixed top-0 left-0  z-40 w-64 h-screen pt-20 bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {links
              .filter((link) => link.allowedRoles.includes(userRole))
              .map((link, index) => (
                <LinkItem key={index} {...link} />
              ))}

            <li onClick={handleLogout}>
              <div className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <IoIosLogOut className="mr-2" />
                <span className="flex-1 me-3">Logout</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
