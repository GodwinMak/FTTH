import React, { useState, useEffect } from "react";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";

const stockItems = ["Drop Cable", "ATB", "Patch Cord", "Cat 6"];

const StockTransfer = () => {
  const [contractorList, setContractorList] = useState([]);
  const [fromContractor, setFromContractor] = useState("");
  const [toContractor, setToContractor] = useState("");
  const [materials, setMaterials] = useState(
    stockItems.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})
  );
  const [ontSerials, setOntSerials] = useState([]); // available ONTs from selected contractor
  const [selectedONTs, setSelectedONTs] = useState([]);

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${PRODUCTION_URL}/contractor`);
        const list = response.data.contractors;
        setContractorList(list);
        if (list.length > 0) {
          setFromContractor(list[0].id);
          setToContractor(list[1]?.id || "");
        }
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      }
    };
    fetchContractors();
  }, []);

  // Fetch ONT serials when fromContractor changes
  useEffect(() => {
    if (!fromContractor) return;
    const fetchONTs = async () => {
      try {
        const res = await axios.get(
          `${PRODUCTION_URL}/ont/available/${fromContractor}`
        );
        setOntSerials(res.data || []);
      } catch (error) {
        console.error("Failed to fetch ONTs:", error);
      }
    };
    fetchONTs();
  }, [fromContractor]);

  const handleMaterialChange = (item, value) => {
    setMaterials({ ...materials, [item]: parseInt(value, 10) || 0 });
  };

  const toggleONTSelection = (sn) => {
    setSelectedONTs((prev) =>
      prev.includes(sn) ? prev.filter((s) => s !== sn) : [...prev, sn]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromContractor || !toContractor || fromContractor === toContractor) {
      alert("Please select different contractors.");
      return;
    }
    try {
      await axios.post(`${PRODUCTION_URL}/stock/transfer`, {
        from_contractor: fromContractor,
        to_contractor: toContractor,
        ont_serials: selectedONTs,
        materials,
      });
      alert("Stock transferred successfully!");
      setSelectedONTs([]);
      setMaterials(stockItems.reduce((acc, item) => ({ ...acc, [item]: 0 }), {}));
    } catch (error) {
      console.error("Failed to transfer stock:", error);
      alert("Stock transfer failed.");
    }
  };

  return (
    <div className="p-4 sm:ml-64 mt-14 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Transfer Stock Between Contractors
      </h1>

      {/* Contractor Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            From Contractor:
          </label>
          <select
            value={fromContractor}
            onChange={(e) => setFromContractor(e.target.value)}
            className="border p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
          >
            {contractorList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractor_company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            To Contractor:
          </label>
          <select
            value={toContractor}
            onChange={(e) => setToContractor(e.target.value)}
            className="border p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
          >
            {contractorList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contractor_company_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ONTs Section */}
      <div className="mb-6 p-4 border rounded bg-white dark:bg-gray-700 dark:text-gray-200">
        <h2 className="text-lg font-semibold mb-2">Select ONTs to Transfer</h2>
        {ontSerials.length === 0 ? (
          <p>No ONTs available for this contractor.</p>
        ) : (
          <ul className="list-disc pl-5">
            {ontSerials.map((sn) => (
              <li key={sn} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedONTs.includes(sn)}
                  onChange={() => toggleONTSelection(sn)}
                />
                <span>{sn}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Other Materials */}
      <form
        className="p-4 border rounded bg-white dark:bg-gray-700 dark:text-gray-200"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold mb-2">Materials Transfer</h2>
        {stockItems.map((item) => (
          <div key={item} className="mb-2 flex justify-between items-center">
            <label>{item}:</label>
            <input
              type="number"
              min="0"
              value={materials[item]}
              onChange={(e) => handleMaterialChange(item, e.target.value)}
              className="border p-1 rounded w-24 dark:bg-gray-600 dark:text-gray-200"
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Transfer Stock
        </button>
      </form>
    </div>
  );
};

export default StockTransfer;
