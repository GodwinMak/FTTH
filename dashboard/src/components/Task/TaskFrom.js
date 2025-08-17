import React, { useState, useEffect } from "react";
import axios from "axios";
import {PRODUCTION_URL} from "../../utils/Api"
import {useAuthContext} from "../../hooks/useAuthContext"
import {useNavigate} from "react-router-dom"

function TaskForm() {
  const navigate = useNavigate(); 
  const [contractor, setContractor] = useState([])
  const {state} = useAuthContext();

  console.log(state.userData);
  useEffect(()=>{
    const fetchData = async () =>{
      await axios.get(`${PRODUCTION_URL}/contractor`)
      .then((res) =>{
        setContractor(res.data.contractors)
      })
    }

    fetchData();
  },[])

  const [taskData, setTaskData] = useState({
    contractor_id: "",
    customer_name: "",
    account_number: "",
    building_name: "",
    building_location: "",
    house_no: "",
    serial_number: "",
    task_type: "",
    contact_number: "",
    case_ticket: "",
    user_id: state.userData.id, // Assuming user ID is available in the auth context
  });

  const [errors, setErrors] = useState({});

  const taskTypes = [
    "New Installation",
    "Offline Due to Fiber",
    "Offline Due to Power",
    "Router Change",
    "Router Relocation",
    "Others"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!taskData.contractor_id) errors.contractor_id = "Contractor is required";
    if (!taskData.customer_name) errors.customer_name = "Customer Name is required";
    if (!taskData.building_name) errors.building_name = "Building is required";
    if (!taskData.building_location) errors.building_location = "Building Location is required";
    if (!taskData.house_no) errors.house_no = "House No is required";
    if (!taskData.contact_number) errors.contact_number = "Contact Number is required";
    if (!taskData.task_type) errors.task_type = "Task Type is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Assuming an API endpoint to create a task
      await axios.post(`${PRODUCTION_URL}/task`, taskData);
      alert("Task created successfully!");
      // Reset form after successful submission
      setTaskData({
        contractors: "",
        customer_name: "",
        account_number: "",
        location: "",
        serial_number: "",
        task_type: "",
        contact_number: "",
        case_ticket: "",
      });
      navigate("/dashboard/pendingtask"); // Redirect to task list or another page
    } catch (error) {
      console.error("Error creating task", error);
      alert("There was an error creating the task.");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 p-6 dark:bg-gray-800 mt-14">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">Create New Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contractor */}
            <div className="form-group">
              <label htmlFor="contractors" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contractor *
              </label>
              <select
                id="contractor_id"
                name="contractor_id"
                // value={taskData.contractor_id}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.contractor_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
              >
                <option value="">Select Contractor</option>
                {contractor && contractor.map((c) => (
                  <option key={contractor} value={c.id}>
                    {c.contractor_company_name}
                  </option>
                ))}
              </select>
              {errors.contractor_id && <p className="mt-1 text-sm text-red-600">{errors.contractor_id}</p>}
            </div>

            {/* Customer Name */}
            <div className="form-group">
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={taskData.customer_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.customer_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Enter Customer Name"
              />
              {errors.customer_name && <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Number */}
            <div className="form-group">
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                id="account_number"
                name="account_number"
                value={taskData.account_number}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter Account Number"
              />
            </div>

            {/* Building Name */}
            <div className="form-group">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building Name *
              </label>
              <input
                type="text"
                id="building_name"
                name="building_name"
                value={taskData.building_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.building_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Enter Location"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.building_name}</p>}
            </div>  
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Building Location */}
            <div className="form-group">
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building Location *
              </label>
              <input
                type="text"
                id="building_location"
                name="building_location"
                value={taskData.building_location}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter Account Number"
              />
            </div>

            {/* House No */}
            <div className="form-group">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                House No *
              </label>
              <input
                type="text"
                id="house_no"
                name="house_no"
                value={taskData.house_no}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.house_no ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Enter Location"
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.house_no}</p>}
            </div>  
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serial Number */}
            <div className="form-group">
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={taskData.serial_number}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Enter Serial Number"
              />
            </div>

            {/* Task Type */}
            <div className="form-group">
              <label htmlFor="task_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Type *
              </label>
              <select
                id="task_type"
                name="task_type"
                value={taskData.task_type}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.task_type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
              >
                <option value="">Select Task Type</option>
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.task_type && <p className="mt-1 text-sm text-red-600">{errors.task_type}</p>}
            </div>
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Number */}
            <div className="form-group">
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Number *
              </label>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={taskData.contact_number}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Enter Contact Number"
              />
              {errors.contact_number && <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>}
            </div>
                
            <div className="form-group">
              <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Case Ticket
              </label>
              <input
                type="text"
                id="case_ticket"
                name="case_ticket"
                value={taskData.case_ticket}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.case_ticket ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Enter Case Ticket"
              />
              {errors.case_ticket && <p className="mt-1 text-sm text-red-600">{errors.case_ticket}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;