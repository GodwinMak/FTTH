import React, {useState, useEffect} from 'react'
import Table,   {SelectColumnFilter } from './Table'
import { PRODUCTION_URL } from '../../utils/Api'
import axios from 'axios'
const Completion = () => {
  const [datum, setDatum] = useState([])
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() =>{
    const fetchData = async () => {
      try {
        await axios.get(`${PRODUCTION_URL}/task/report`)
        .then(res =>{
          console.log(res.data.tasks[0].task_completion)
          setDatum({
            data: res.data.tasks.map((task) => ({
              id: task.id,
              building_name: task.building_name,
              building_location: task.building_location,
              customer_name: task.customer_name,
              account_number: task.account_number,
              serial_number: task.task_completion.serial_number,
              installation_date: formatDate(task.task_completion?.createdAt),
              case_ticket: task.case_ticket,
              cable_type: task.task_completion.cable_type,
              cable_used: task.task_completion.cable_length || 0,
              orm1: task.task_completion.no_atb || 0,
              ont: task.task_completion.no_ont || 0,
              sleeve: task.task_completion.no_sleeve || 0,
              task_type: task.task_completion.task_type,
              contractor: task.contractor.contractor_company_name
            }))
          })
        })
        
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  },[])




  const columns = React.useMemo(() =>[
    { Header: "Building Name", accessor: "building_name" },
    { Header: "Building Location", accessor: "building_location" },
    {
      Header: "CUSTOMER",
      accessor: "customer_name"
    },
    {
      Header: "Account",
      accessor: "account_number"
    },
    {
      Header: "SERIAL NO",
      accessor: "serial_number"
    },
    {
      Header: "DATE",
      accessor: "installation_date"
    },
    {
      Header: "CASE TICKET",
      accessor: "case_ticket"
    },
    {
      Header: "Cable Type",
      accessor: "cable_type"
    },
    {
      Header: "CABLE USED (m)",
      accessor: "cable_used"
    },
    {
      Header: "ORM1",
      accessor: "orm1"
    },
    {
      Header: "ONT",
      accessor: "ont"
    },
    {
      Header: "SLEEVE",
      accessor: "sleeve"
    },
    {
      Header: "Task",
      accessor: "task_type"
    },
    {
      Header: "Contractor",
      accessor: "contractor",
      Filter: SelectColumnFilter,
      filter: 'includes',
    },

  ])

  const data = React.useMemo(() => datum.data || [], [datum.data]);
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 lg:flex-row translate-all duration-300 mt-14 dark:bg-gray-800 min-h-screen">
    <main className="px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Contractor Completion Form </h1>
      </div>
      <div className="mt-6">
        <Table columns={columns} data={data} />
      </div>
    </main>
  </div>
  )
}

export default Completion