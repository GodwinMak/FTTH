import React, { useState, useEffect } from "react";
import axios from "axios";
import Table, { SelectColumnFilter } from "./Table";
import { PRODUCTION_URL } from "../../utils/Api";
import { useNavigate } from "react-router-dom";

const StockTransferReport = () => {
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await axios.get(`${PRODUCTION_URL}/stock/assignments`);
        setAssignments(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to fetch stock transfers:", err);
      }
    };
    fetchTransfers();
  }, []);

  const handleUsageReport = async (assignmentId) => {
    navigate(`/dashboard/stock-usage-report/${assignmentId}`);
  };

  const columns = React.useMemo(() => [
    {
      Header: "Date",
      accessor: (row) => {
        const date = new Date(row.created_at);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      id: "created_at",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
    { Header: "Item Type", accessor: "item_type" },
    { Header: "Item Value", accessor: "item_value" },
    { Header: "Quantity", accessor: "quantity" },
    {
      Header: "From Contractor",
      accessor: (row) =>
        row.sourceContractor?.contractor_company_name || "RAHA LIMITED",
      id: "fromContractor",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
    {
      Header: "To Contractor",
      accessor: (row) => row.toContractor.contractor_company_name || "-",
      id: "toContractor",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
    {
      Header: "Source",
      accessor: "source",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
    {
      Header: "Status",
      accessor: "status",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
    {
      Header: "Action",
      accessor: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-white hover:text-blue-200 bg-blue-600 p-2 rounded-md"
            onClick={() => handleUsageReport(row.id)}
          >
            View Usage
          </button>
        </div>
      ),
    },
  ]);

  const data = React.useMemo(() => assignments, [assignments]);

  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Stock Transfer Report</h1>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>
    </div>
  );
};

export default StockTransferReport;
