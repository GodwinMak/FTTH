import React, { useEffect, useState } from "react";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [contractors, setContractors] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    user_type: "",
    contractor_id: "",
  });

  useEffect(() => {
    axios
      .get(`${PRODUCTION_URL}/contractor`)
      .then((res) => setContractors(res.data.contractors))
      .catch((err) => console.error("Failed to load contractors", err));
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || "",
        phone_number: user.contact || "",
        email: user.email || "",
        password: "",
        user_type: user.role || "",
        contractor_id: user.contractor_id || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${PRODUCTION_URL}/user/${user.id}`, formData);
      alert("User updated successfully");
      onUserUpdated(); // callback to refresh user list
      onClose();
    } catch (error) {
      console.error("Error updating user", error);
      alert("Failed to update user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit User</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Full Name"
            />
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Phone Number"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Email"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="New Password (optional)"
            />
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
            >
              <option value="">Select Type</option>
              <option value="admin">Admin</option>
              <option value="contractor">Contractor</option>
              <option value="support">Support</option>
            </select>
            {formData.user_type === "contractor" && (
              <select
                name="contractor_id"
                value={formData.contractor_id}
                onChange={handleChange}
                className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              >
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractor_company_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
