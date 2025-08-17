import React, {useState, useEffect} from 'react'
import axios from "axios"
import Table, { SelectColumnFilter } from "./Table";
import { PRODUCTION_URL } from '../../utils/Api'
import {useAuthContext} from "../../hooks/useAuthContext"

const ContractorTaks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false)
  const {state} = useAuthContext()


  useEffect(()=>{
    const fetchTasks = async () => {
    setLoading(true); // ✅ Start loader
    try {
      const response = await axios.get(
        `${PRODUCTION_URL}/task/getTasksByContractorId/${state.userData.contractor_id}`
      );
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // ✅ Stop loader
    }

  };
  fetchTasks()
  },[])


   const columns = React.useMemo(
      () => [
        { Header: "Name", accessor: "customer_name" },
        { Header: "Account Number", accessor: "account_number" },
        { Header: "Building Name", accessor: "building_name" },
        { Header: "Building Location", accessor: "building_location" },
        { Header: "Contact Number", accessor: "contact_number" },
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
                  ? "bg-yellow-600 text-white"
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
      ],
      []
    );

    console.log(tasks)
  
   const data = React.useMemo(() => {
      return tasks.map((task) => ({
        id: task.id,
        customer_name: task.customer_name,
        account_number: task.account_number,
        building_name: task.building_name,
        building_location: task.building_location,
        contact_number: task.contact_number,
        status: task.status,
        task_type: task.task_type,
      }));
    }, [tasks]);
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Task </h1>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>
    </div>
  )
}

export default ContractorTaks