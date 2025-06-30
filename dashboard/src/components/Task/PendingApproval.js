import React, {useEffect, useState} from "react";
import Table, { SelectColumnFilter } from "./Table";
// import { tasks } from '../../constants';
import { useNavigate } from "react-router-dom";
import { PRODUCTION_URL } from "../../utils/Api";
import axios from "axios";

const PendingApproval = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);


  // const filteredTasks = tasks.filter((task) => task.status === "Completed");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get(`${PRODUCTION_URL}/task/getTasksByStatus?status=Closed`)
        .then(res =>{
          setTasks(res.data.tasks);
        })
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const columns = React.useMemo(() => [
    { Header: "Name", accessor: "customer_name" },
    { Header: "Account Number", accessor: "account_number" },
    { Header: "Location", accessor: "location" },
    { Header: "Serial Number", accessor: "serial_number" },
    { Header: "Contact Number", accessor: "contact_number" },
    {
      Header: "Contractor",
      accessor: "contractor",
      Filter: SelectColumnFilter,
      filter: 'includes',
    },
    { Header: "Task Type", accessor: "task_type" },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <button
          onClick={() => navigate("/dashboard/approvetask", { state: {id: row.original.id} })}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          View Task
        </button>
      ),
      disableSortBy: true,
      disableFilters: true,
    }
  ], [navigate]);
console.log(tasks)
  const data = React.useMemo(()=>{
    return tasks.map((task)=>({
      id: task.id,
      customer_name: task.customer_name,
      account_number: task.account_number,
      location: task.location,
      serial_number: task.task_completion.serial_number,
      contact_number: task.contact_number,
      contractor: task.contractor
        ? task.contractor.contractor_company_name
        : "Unknown",
      status: task.status,
      task_type: task.task_type,
      completeTask: task.task_completion
    }))
  })

  console.log(data)
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">System Pending Approvals</h1>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>
    </div>
  );
};

export default PendingApproval;
