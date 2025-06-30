import React, {useEffect, useState} from 'react'
import UserTable, { AvatarCell, SelectColumnFilter, StatusPill } from './UserTable';
import { useNavigate } from 'react-router-dom';
import ContractorTable from "./ContractorTable"
import axios from 'axios';
import { PRODUCTION_URL } from '../../utils/Api';
import EditContractorModal from './EditContractorModal';


const Contractor = () => {
  const [contractors, setContractors] = useState([])
  const navigate = useNavigate(
  )
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editContractor, setEditContractor] = useState(null);

  const handleEdit = (contractor) => {
    console.log(contractor)
    console.log(contractor)
    setEditContractor(contractor);
    setEditModalOpen(true);
  }

  const handleDelete = async (contractor) => {
    console.log(contractor)
    const confirm = window.confirm(`Are you sure to delete ${contractor.contractor_company_name}?`);
    if (!confirm) return;

    try {
      await axios.delete(`${PRODUCTION_URL}/contractor/${contractor.id}`);
      setContractors((prev) => prev.filter((u) => u.id !== contractor.id));
    } catch (err) {
      alert("Failed to delete user");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${PRODUCTION_URL}/contractor`);
        setContractors(response.data.contractors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


  const handleCreateContractor = () =>{
    navigate("/dashboard/createcontractor")
  }

  const columns = React.useMemo(()=> [
    {
      Header: "Name",
      accessor: "contractor_company_name",
    },
    {
      Header: "contact Number",
      accessor: "contact_number"
    },
    {
      Header: "Office Number",
      accessor: "office_location"
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => handleDelete(row.original)}
          >
            Delete
          </button>
        </div>
      ),
    },    
  ])

  const data = React.useMemo(() => {
    return contractors.map((contractor) => ({
      contractor_company_name: contractor.contractor_company_name,
      contact_number: contractor.contact_number,
      office_location: contractor.office_location,
      id: contractor.id
    }))
  })
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 lg:flex-row translate-all duration-300 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">System Contractor Management</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded" onClick={handleCreateContractor}>
            Create Contractor
          </button>
        </div>
        <div className="mt-6">
          <ContractorTable columns={columns} data={data} />
        </div>
      </main>
      {editModalOpen && (
        <EditContractorModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          contractorDatum={editContractor}
          onContractorUpdated ={() =>{
            axios.get(`${PRODUCTION_URL}/contractor`)
            .then((res) => setContractors(res.data.contractors))
          }}
        />
      )}
    </div>
  )
}

export default Contractor