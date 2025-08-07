import React, { useState, useEffect } from "react";
import axios from "axios";
import Table, { SelectColumnFilter } from "./Table";
import { PRODUCTION_URL } from "../../utils/Api";
import { useParams } from "react-router-dom";

const StockUsageReport = () => {
  const { id } = useParams();
  console.log(id);

  const [usageData, setUsageData] = useState([]);

  const handleUsageReport = async () => {
    try {
      const res = await axios.get(`${PRODUCTION_URL}/stock/usage-report/${id}`);
      setUsageData(res.data);
    } catch (err) {
      console.error("Failed to fetch usage report:", err);
    }
  };

  useEffect(() => {
    handleUsageReport();
  }, []);

  const columns = React.useMemo(() => [
    {
      Header: "Date",
      accessor: (row) => {
        const date = new Date(row.createdAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      id: "created_at",
    },
    {
      Header: "Customer Name",
      accessor: (row) => row.taskCompletion?.task.customer_name || "-",
    },
    {
      Header: "Account Number",
      accessor: (row) => row.taskCompletion?.task.account_number || "-",
    },
    { Header: "Item_value", accessor: "item_value" },
    { Header: "Quantity Used", accessor: "quantity_used" },
    {
      Header: "Contactor",
      accessor: (row) => row.contractor?.contractor_company_name || "-",
      Filter: SelectColumnFilter,
      filter: "includes",
    },
  ]);

  const data = React.useMemo(() => usageData, [usageData]);

  console.log(data);
  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Stock Usage Report</h1>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={data} />
        </div>
      </main>
    </div>
  );
};

export default StockUsageReport;
