import React, { useState, useEffect } from "react";
import Table, { SelectColumnFilter } from "./Table";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";
import { useTaskContext } from "../../hooks/useTaskContext";
import { useAuthContext } from "../../hooks/useAuthContext";

const PendingTask = () => {
  const [tasks, setTasks] = useState([]);
  const { dispatch } = useTaskContext();
  const navigate = useNavigate();

  // Transfer modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [taskToTransfer, setTaskToTransfer] = useState(null);
  const [newContractor, setNewContractor] = useState("");
  const [contractor, setContractor] = useState([]);
  const { state } = useAuthContext();
  const [selectedContractor, setSelectedContractor] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${PRODUCTION_URL}/task/getTasksByStatus?status=notRejected`
      );
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleView = async (task) => {
    try {
      const res = await axios.get(`${PRODUCTION_URL}/task/${task.id}`);
      dispatch({ type: "SET_TASK", payload: res.data });
      navigate("/dashboard/taskview");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${PRODUCTION_URL}/task/${task.id}`);
        setTasks(tasks.filter((t) => t.id !== task.id));
        alert("Task deleted successfully!");
      } catch (err) {
        console.error("Error deleting task:", err);
        alert("Failed to delete task.");
      }
    }
  };

  const handleTransfer = (task) => {
    setTaskToTransfer(task);
    setShowTransferModal(true);
  };

  const submitTransfer = async () => {
    if (!taskToTransfer || !newContractor) return;

    try {
      await axios.post(`${PRODUCTION_URL}/task/transfer/${taskToTransfer.id}`, {
        contractor_id: newContractor,
        user_id: state.userData.id, // Assuming user_id is needed for the transfer
      });

      setShowTransferModal(false);
      setTaskToTransfer(null);
      setNewContractor("");
      fetchTasks(); // Refresh tasks
      alert("Task transferred successfully!");
    } catch (err) {
      console.error("Error transferring task:", err);
      alert("Failed to transfer task.");
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Name", accessor: "customer_name" },
      { Header: "Account Number", accessor: "account_number" },
      { Header: "Building Name", accessor: "building_name" },
      { Header: "Building Location", accessor: "building_location" },
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
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 rounded"
              onClick={() => handleTransfer(row.original)}
            >
              Transfer
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
    ],
    []
  );

  const data = React.useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        customer_name: task.customer_name,
        account_number: task.account_number,
        building_name: task.building_name,
        building_location: task.building_location,
        contact_number: task.contact_number,
        contractor: task.contractor?.contractor_company_name || "Unknown",
        status: task.status,
        task_type: task.task_type,
      })),
    [tasks]
  );

  useEffect(() => {
    const fecthData = async () => {
      const res = await axios.get(`${PRODUCTION_URL}/contractor`);

      console.log(res.data);

      setContractor(res.data.contractors);
    };
    fecthData();
  }, []);

  const handleCreateTask = () => {
    navigate("/dashboard/taskform");
  };

  const handleGenerateReport = async () => {
    if (selectedContractor !== "") {
      const reportTasks = tasks.filter(
        (task) =>
          task.status === "In Progress" &&
          task.contractor_id === selectedContractor
      );

      const reportText = reportTasks
        .map(
          (task) =>
            `${task.customer_name} ${task.building_name} ${task.account_number} ${task.contact_number} ${task.task_type}`
        )
        .join("\n");

      setSelectedContractor("");
      navigate("/dashboard/contractorreport", { state: { reportText } });
    } else {
      alert("Please select a contractor to generate the report.");
    }
  };
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">System Pending Task</h1>
          <div className="flex space-x-2">
            <select
              className="border rounded px-8 py-1"
              value={selectedContractor}
              onChange={(e) => setSelectedContractor(e.target.value)}
            >
              {/* <option value="LEEMTECH">LEEMTECH</option>
              <option value="MCOM">MCOM</option>
              <option value="KLIKTECH">KLIKTECH</option> */}
              <option value="">Select Contractor</option>
              {contractor.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.contractor_company_name}
                </option>
              ))}
            </select>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              onClick={handleCreateTask}
            >
              Create Task
            </button>
          </div>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Transfer Task
            </h3>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Select New Contractor
            </label>
            <select
              className="w-full border px-3 py-2 rounded mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={newContractor}
              onChange={(e) => setNewContractor(e.target.value)}
            >
              <option value="">Select Contractor</option>
              {/* <option value="1">LEEMTECH</option>
              <option value="2">MCOM</option>
              <option value="3">KLIKTECH</option> */}
              {contractor.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.contractor_company_name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={submitTransfer}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTask;
