import React, { useState, useEffect } from "react";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";

const stockItems = ["DropCable", "ORM 1", "Cat 6", "Patch code"];

const AssignStock = () => {
  const [contractorList, setContractorList] = useState([]);
  const [contractorSummary, setContractorSummary] = useState({});
  const [contractor, setContractor] = useState("");
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [intervalId, setIntervalId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [materials, setMaterials] = useState(
    stockItems.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})
  );
  const [ontModel, setOntModel] = useState("");

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await axios.get(`${PRODUCTION_URL}/contractor`);
        const list = response.data.contractors;
        setContractorList(list);
        if (list.length > 0) {
          setContractor(list[0].id); // ✅ set ID instead of name
        }
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      }
    };
    fetchContractors();
  }, []);

  // Fetch summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(
          `${PRODUCTION_URL}/stock/contractor-materials-summary`
        );
        const data = res.data;
        console.log(data);
        const summary = {};
        for (const [id, info] of Object.entries(data)) {
          const name = info.contractor_company_name;
          summary[name] = {
            ONT: info.ont || {},
            DropCable: info.cables?.["Drop Cable"] || 0,
            "Cat 6": info.cables?.["CAT 6 Cable"] || 0,
            "ORM 1": info.atb || 0,
            "Patch code": info.patch || 0,
          };
        }

        setContractorSummary(summary);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (intervalId) clearInterval(intervalId);
      if (evt.code === "Enter") {
        if (barcode) handleBarcode(barcode);
        setBarcode("");
        return;
      }
      if (evt.key !== "Shift") setBarcode((prev) => prev + evt.key);
      const id = setInterval(() => setBarcode(""), 20);
      setIntervalId(id);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (intervalId) clearInterval(intervalId);
    };
  }, [barcode, intervalId]);

  const handleBarcode = (scannedBarcode) => {
    const trimmed = scannedBarcode.trim();
    if (!serialNumbers.includes(trimmed)) {
      setSerialNumbers((prev) => [...prev, trimmed]);
    }
  };

  const handleSelect = (sn) => {
    setSelected((prev) =>
      prev.includes(sn) ? prev.filter((item) => item !== sn) : [...prev, sn]
    );
  };

  const handleRemoveSelected = () => {
    setSerialNumbers((prev) => prev.filter((sn) => !selected.includes(sn)));
    setSelected([]);
  };

  const handleClearAll = () => {
    setSerialNumbers([]);
    setSelected([]);
  };

  const handleMaterialChange = (item, value) => {
    setMaterials({ ...materials, [item]: parseInt(value, 10) || 0 });
  };

  const submitOnts = async (e) => {
    e.preventDefault();
    if (!ontModel) {
      alert("Please select ONT model.");
      return;
    }
    if (serialNumbers.length === 0) {
      alert("No ONT serial numbers to assign!");
      return;
    }

    try {
      await axios.post(`${PRODUCTION_URL}/ont/create`, {
        contractor_id: contractor,
        model_number: ontModel,
        serial_number: serialNumbers,
      });
      alert("ONTs assigned successfully!");
      setSerialNumbers([]);
      setSelected([]);
    } catch (err) {
      console.error("Failed to assign ONTs:", err);
      alert("Failed to assign ONTs.");
    }
  };

  const submitMaterials = async (e) => {
    e.preventDefault();
    try {
      if (Object.values(materials).every((v) => v === 0)) {
        alert("No materials to assign!");
        return;
      }
      await axios
        .post(`${PRODUCTION_URL}/stock/update`, {
          contractor,
          materials,
        })
        .then((response) => {
          alert("Materials assigned successfully!");
          setMaterials(
            stockItems.reduce((acc, item) => ({ ...acc, [item]: 0 }), {})
          );
        });
    } catch (error) {
      console.error("Error submitting materials:", error);
      alert("Failed to assign materials.");
      return;
    }
  };

  const contractorNames = contractorList.map((c) => c.contractor_company_name);

  return (
    <div className="p-4 sm:ml-64 mt-14 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Assign ONTs & Materials to Contractor
      </h1>

      {/* SUMMARY BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {contractorNames.length === 0 ? (
          <p className="text-gray-600">Loading summary...</p>
        ) : (
          contractorNames.map((c) => (
            <div
              key={c}
              className="p-3 rounded bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow"
            >
              <h2 className="text-lg font-semibold mb-2">{c}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  ONTs:
                  {contractorSummary[c]?.ONT &&
                  Object.keys(contractorSummary[c].ONT).length > 0 ? (
                    Object.entries(contractorSummary[c].ONT).map(
                      ([model, count]) => (
                        <div key={model}>
                          {model}: {count}
                        </div>
                      )
                    )
                  ) : (
                    <div>No ONTs assigned</div>
                  )}
                </div>
                <div>DropCable: {contractorSummary[c]?.DropCable || 0}</div>
                <div>ORM 1: {contractorSummary[c]?.["ORM 1"] || 0}</div>
                <div>Cat 6: {contractorSummary[c]?.["Cat 6"] || 0}</div>
                <div>
                  Patch code: {contractorSummary[c]?.["Patch code"] || 0}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CONTRACTOR SELECT */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 dark:text-gray-300">
          Select Contractor:
        </label>
        <select
          value={contractor}
          onChange={(e) => setContractor(e.target.value)}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-gray-200"
        >
          {contractorList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.contractor_company_name}
            </option>
          ))}
        </select>
      </div>

      {/* ONTs Section */}
      <div className="mb-6 p-4 border rounded bg-white dark:bg-gray-700 dark:text-gray-200">
        <div className="flex flex-row gap-3 items-center mb-5">
          <label className="text-gray-700 dark:text-gray-300">ONT TYPE</label>
          <select
            className="border p-2 rounded  dark:bg-gray-700 dark:text-gray-200"
            value={ontModel}
            onChange={(e) => setOntModel(e.target.value)}
          >
            <option>Select ONT type</option>
            <option>Huawei Model HG8145V5</option>
            <option>Huawei Model F5DOO</option>
            <option>VSOL ONU</option>
          </select>
        </div>
        <h2 className="text-lg font-semibold mb-2">ONT Serial Numbers</h2>
        {serialNumbers.length === 0 ? (
          <p>No serial numbers scanned yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {serialNumbers.map((sn, index) => (
              <li key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selected.includes(sn)}
                  onChange={() => handleSelect(sn)}
                />
                <span>{sn}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={submitOnts}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Assign ONTs
          </button>
          <button
            onClick={handleRemoveSelected}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            disabled={selected.length === 0}
          >
            Remove Selected
          </button>
          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Materials Section */}
      <form
        className="mb-4 p-4 border rounded bg-white dark:bg-gray-700 dark:text-gray-200"
        onSubmit={submitMaterials}
      >
        <h2 className="text-lg font-semibold mb-2">Additional Materials</h2>
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
          // onClick={submitMaterials}
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Assign Materials
        </button>
      </form>
    </div>
  );
};

export default AssignStock;
