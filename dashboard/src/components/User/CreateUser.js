import React, { useState, useEffect } from "react";
import axios from "axios";
import {PRODUCTION_URL} from "../../utils/Api"
import { useNavigate } from "react-router-dom";
const CreateUser = () => {

  const navigate = useNavigate();
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    axios.get(`${PRODUCTION_URL}/contractor`)
      .then((res) => setContractors(res.data.contractors))
      .catch((err) => console.error("Failed to load contractors", err));
  }, []);
  const [userData, setUserData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    user_type: "",
    contractor_id: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!userData.full_name) errors.full_name = "Full name is required";
    if (!userData.phone_number)
      errors.phone_number = "Phone number is required";
    if (!userData.user_type) errors.user_type = "User type is required";
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
      await axios.post(`${PRODUCTION_URL}/user`, userData);
      alert("User created successfully!");
      setUserData({
        full_name: "",
        phone_number: "",
        email: "",
        password: "",
        user_type: "",
        contractor_id: "",
      });
      navigate("/dashboard/user"); // Redirect to users list or any other page
    } catch (error) {
      console.error("Error creating user", error);
      alert("There was an error creating the user.");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 p-6 dark:bg-gray-800 mt-14">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 dark:bg-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">
          Create New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={userData.full_name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.full_name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Full Name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Phone Number *
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={userData.phone_number}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.phone_number ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                placeholder="Phone Number"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone_number}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Email"
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label
                htmlFor="user_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                User Type *
              </label>
              <select
                id="user_type"
                name="user_type"
                value={userData.user_type}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.user_type ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
              >
                <option value="">Select Type</option>
                <option value="admin">Admin</option>
                <option value="contractor">Contractor</option>
                <option value="support">Support</option>
                <option value="admin_contractor">Admin Contractor</option>

              </select>
              {errors.user_type && (
                <p className="mt-1 text-sm text-red-600">{errors.user_type}</p>
              )}
            </div>

            {(userData.user_type === "contractor" || userData.user_type === "admin_contractor") && (
              <div className="form-group">
                <label
                  htmlFor="contractor_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Contractor Name
                </label>
                <select
                  id="contractor_id"
                  name="contractor_id"
                  value={userData.contractor_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Select Contractor</option>
                  {contractors && contractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.contractor_company_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
