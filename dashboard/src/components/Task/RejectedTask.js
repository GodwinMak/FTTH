import React, { useState, useEffect } from "react";
import Table, { SelectColumnFilter } from "./Table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";
import { useTaskContext } from "../../hooks/useTaskContext";
const RejectedTask = () => {
  const [tasks, setTasks] = useState([]);

  const {dispatch} = useTaskContext();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTION_URL}/task/getTasksByStatus?status=Rejected`
        );
        if (response.data && response.data.tasks) {
          setTasks(response.data.tasks);
        } else {
          console.error("No tasks found in the response");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  const navigate = useNavigate();
  const [selectedContractor, setSelectedContractor] = useState("LEEMTECH"); // default contractor

  const handleCreateTask = () => {
    navigate("/dashboard/taskform");
  };

  const handleGenerateReport = () => {
    const reportTasks = tasks.filter(
      (task) =>
        task.status === "In Progress" && task.contractor === selectedContractor
    );

    const reportText = reportTasks
      .map(
        (task) =>
          `${task.customer_name} ${task.location} ${task.account_number} ${task.contact_number} ${task.task_type}`
      )
      .join("\n");

    navigate("/dashboard/contractorreport", { state: { reportText } });
  };

  const handleView = async (task) => {
    try {
      await axios
        .get(`${PRODUCTION_URL}/task/${task.id}`)
        .then((res) => {
          dispatch({ type: "SET_TASK", payload: res.data });
          navigate("/dashboard/taskview")
        });
    } catch (error) {
      console.log(error);
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "customer_name" },
      { Header: "Account Number", accessor: "account_number" },
      { Header: "Location", accessor: "location" },
      { Header: "Serial Number", accessor: "serial_number" },
      { Header: "Contact Number", accessor: "contact_number" },
      {
        Header: "Contractor",
        accessor: "contractor",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Task Type",
        accessor: "task_type",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ cell: { value } }) => (
          <span
            className={`px-1 py-1 rounded ${
              value === "In Progress"
                ? "bg-yellow-200 text-white"
                : value === "On Hold"
                ? "bg-orange-500 text-white"
                : value === "Rejected"
                ? "bg-red-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {value}
          </span>
        ),
        Filter: SelectColumnFilter,
        filter: "includes",
      },

      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
              onClick={() => handleView(row.original)}
            >
              View
            </button>
            {/* <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              // onClick={() => handleEdit(row.original)}
            >
              Update
            </button> */}
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              // onClick={() => handleDelete(row.original)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      customer_name: task.customer_name,
      account_number: task.account_number,
      location: task.location,
      serial_number: task.serial_number,
      contact_number: task.contact_number,
      contractor: task.contractor
        ? task.contractor.contractor_company_name
        : "Unknown",
      status: task.status,
      task_type: task.task_type,
    }));
  }, [tasks]);

  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">System Rejected Task</h1>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>
    </div>
  );
};

export default RejectedTask;
