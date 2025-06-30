import React from "react";
import { useLocation } from "react-router-dom";

const ContractorReport = () => {
  const location = useLocation();
  const reportText = location.state?.reportText || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    alert("Report copied to clipboard!");
  };

  return (
    <div className="p-4 sm:ml-64 mt-14 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Contractor Report
      </h1>
      <textarea
        className="w-full h-96 p-4 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        value={reportText}
        readOnly
      />
      <button
        onClick={handleCopy}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
      >
        Copy Report
      </button>
    </div>
  );
};

export default ContractorReport;
