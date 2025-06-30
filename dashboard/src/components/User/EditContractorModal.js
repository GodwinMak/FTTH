import React, { useEffect, useState } from "react";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";

const EditContractorModal = ({
  isOpen,
  onClose,
  contractorDatum,
  onContractorUpdated,
}) => {
  const [contractorData, setContractorData] = useState({
    contractor_company_name: "",
    contact_number: "",
    office_location: "",
  });

  useEffect(() => {
    console.log(contractorDatum)
    if (contractorDatum) {
      setContractorData({
        contractor_company_name: contractorDatum.contractor_company_name || "",
        contact_number: contractorDatum.contact_number || "",
        office_location: contractorDatum.office_location || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log(contractorDatum)
    try {
      await axios.put(
        `${PRODUCTION_URL}/contractor/${contractorDatum.id}`,
        contractorData
      );
      alert("Contractor updated successfully");
      onContractorUpdated(); // callback to refresh user list
      onClose();
    } catch (error) {
      console.error("Error updating contractor", error);
      alert("Failed to update contractor");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Edit Contractor
        </h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="contractor_company_name"
              value={contractorData.contractor_company_name}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Company Name"
            />
            <input
              name="contact_number"
              value={contractorData.contact_number}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Contact  Number"
            />
            <input
              name="office_location"
              type="text"
              value={contractorData.office_location}
              onChange={handleChange}
              className="p-2 border rounded dark:bg-gray-600 dark:text-white"
              placeholder="Office Location"
            />
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

export default EditContractorModal;
