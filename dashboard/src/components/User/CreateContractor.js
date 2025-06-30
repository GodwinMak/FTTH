import React, {useState} from 'react'
import axios from 'axios';
import {PRODUCTION_URL} from "../../utils/Api"
import {useNavigate} from "react-router-dom";

const CreateContractor = () => {
  const navigate = useNavigate();

  const [contractorData, setContractorData] =useState({
    contractor_company_name: "",
    contact_number: "",
    office_location: ""
  })

  const [errors, setErrors] = useState({});


  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractorData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!contractorData.contractor_company_name) errors.contractor_company_name = "Contractor  Name is required";
    if (!contractorData.contact_number) errors.contact_number = "Contact  Number is required";
    if (!contractorData.office_location) errors.office_location = "Office Location is required";
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
      await axios.post(`${PRODUCTION_URL}/contractor`, contractorData);
      alert("Contractor created successfully!");
      // Reset form after successful submission
      setContractorData({
        contractor_company_name: "",
        contact_number: "",
        office_location: ""
      });
      navigate("/dashboard/contractor"); // Redirect to contractors list or any other page
    } catch (error) {
      console.error("Error creating task", error);
      alert("There was an error creating the task.");
    }
  };
  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 p-6 dark:bg-gray-800 mt-14">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">Create New Contractor </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Number */}
            <div className="form-group">
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contractor Company Name *
              </label>
              <input
                type="text"
                id="contractor_company_name"
                name="contractor_company_name"
                value={contractorData.contractor_company_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.contractor_company_name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}

                placeholder="Company Name"
              />
              {errors.contractor_company_name && <p className="mt-1 text-sm text-red-600">{errors.contractor_company_name}</p>}

            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Number *
              </label>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={contractorData.contact_number}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Contact  Number"
              />
              {errors.contact_number && <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>}
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serial Number */}
            <div className="form-group">
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Office Location *
              </label>
              <input
                type="text"
                id="office_location"
                name="office_location"
                value={contractorData.office_location}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${errors.office_location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}

                placeholder="Office Location"
              />
              {errors.office_location && <p className="mt-1 text-sm text-red-600">{errors.office_location}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Create Contractor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateContractor