import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Table from "./Table";
import { PRODUCTION_URL } from "../../utils/Api";
import * as XLSX from "xlsx";
import Slider from "react-slick";

// price mappings
const PRICE_MAP = {
  "Apartment Installation +Activation": 45000,
  "Relocation(Installation+Activation)": 45000,
  Activation: 15000,
  "Apartment Installation": 30000,
  "Relocation(Installation)": 30000,
  Troubleshooting: 30000,
};

const OTHER_PRICE_MAP = {
  "Access Point": 45000,
  "Cable installation": 700,
  Splicing: 8000,
  "Distribution box installation": 15000,
  "Closure preparation and installation": 30000,
  "Extender installation": 30000,
};

const Completion = () => {
  const [tasks, setTasks] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const user = JSON.parse(localStorage.getItem("userData"));

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // fetch contractor list
  const fetchContractors = async () => {
    try {
      const res = await axios.get(`${PRODUCTION_URL}/contractor`);
      setContractors(res.data.contractors);
    } catch (err) {
      console.error("Error fetching contractors", err);
    }
  };

  useEffect(() => {
    if (user.user_type !== "admin") {
      fetchData();
    } else {
      fetchContractors();
    }
  }, []);

  // fetch tasks
  const fetchData = async (month, contractorId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${PRODUCTION_URL}/task/report`, {
        params: { month, contractorId },
      });
      setTasks(res.data.tasks || []);
      setLoadData(true);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  /** ================== TABLE 1 (Normal Tasks) ================== */
  const normalTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.task_completion?.task_type !== "Others")
        .map((task) => {
          const tt = task.task_completion?.task_type;
          const price = PRICE_MAP[tt] || 0;
          return {
            id: task.id,
            building_name: task.building_name,
            building_location: task.building_location,
            customer_name: task.customer_name,
            account_number: task.account_number,
            serial_number: task.task_completion.serial_number,
            installation_date: formatDate(task.task_completion?.createdAt),
            case_ticket: task.case_ticket,
            cable_type: task.task_completion.cable_type,
            cable_used: task.task_completion.cable_length || 0,
            orm1: task.task_completion.no_atb || 0,
            ont: task.task_completion.no_ont || 0,
            sleeve: task.task_completion.no_sleeve || 0,
            task_type: tt,
            contractor: task.contractor.contractor_company_name,
            price,
          };
        }),
    [tasks]
  );

  const normalColumns = useMemo(
    () => [
      { Header: "Building Name", accessor: "building_name" },
      { Header: "Location", accessor: "building_location" },
      { Header: "Customer", accessor: "customer_name" },
      { Header: "Account", accessor: "account_number" },
      { Header: "Serial No", accessor: "serial_number" },
      { Header: "Date", accessor: "installation_date" },
      { Header: "Case Ticket", accessor: "case_ticket" },
      { Header: "Cable Type", accessor: "cable_type" },
      { Header: "Cable Used (m)", accessor: "cable_used" },
      { Header: "ORM1", accessor: "orm1" },
      { Header: "ONT", accessor: "ont" },
      { Header: "Sleeve", accessor: "sleeve" },
      { Header: "Task", accessor: "task_type" },
      { Header: "Price", accessor: "price" },
    ],
    []
  );

  // summary for normal tasks
  const summaryNormal = useMemo(() => {
    const counts = {};
    normalTasks.forEach((t) => {
      if (!counts[t.task_type]) counts[t.task_type] = { unit: 0, subtotal: 0 };
      counts[t.task_type].unit += 1;
      counts[t.task_type].subtotal += t.price;
    });
    return counts;
  }, [normalTasks]);

  /** ================== TABLE 2 (Other Tasks) ================== */
  const otherTasks = useMemo(() => {
    return tasks
      .filter((t) => t.task_completion?.task_type === "Others")
      .flatMap((t) =>
        (t.task_completion?.other_tasks || []).map((ot, i) => ({
          id: `${t.id}-${i}`,
          // contractor: t.contractor.contractor_company_name,
          building_name: t.building_name,
          task_type: ot.task_type,
          amount: ot.amount,
          price: (OTHER_PRICE_MAP[ot.task_type] || 0) * (ot.amount || 1),
        }))
      );
  }, [tasks]);

  const otherColumns = useMemo(
    () => [
      // { Header: "Contractor", accessor: "contractor" },
      { Header: "Building Name", accessor: "building_name" },
      { Header: "Task Type", accessor: "task_type" },
      { Header: "Amount", accessor: "amount" },
      { Header: "Price", accessor: "price" },
    ],
    []
  );

  // summary for other tasks
  const summaryOther = useMemo(() => {
    const counts = {};
    otherTasks.forEach((ot) => {
      if (!counts[ot.task_type])
        counts[ot.task_type] = { unit: 0, subtotal: 0 };
      counts[ot.task_type].unit += ot.amount;
      counts[ot.task_type].subtotal += ot.price;
    });
    return counts;
  }, [otherTasks]);

  /** ================== COMBINED SUMMARY ================== */
  const combinedSummary = useMemo(() => {
    // start with normal summary
    const merged = { ...summaryNormal };

    // merge other summary into merged
    Object.entries(summaryOther).forEach(([tt, val]) => {
      if (!merged[tt]) merged[tt] = { unit: 0, subtotal: 0 };
      merged[tt].unit += val.unit;
      merged[tt].subtotal += val.subtotal;
    });

    // 1️⃣ total sleeve from normalTasks
    const totalSleeveFromNormal = normalTasks.reduce(
      (sum, t) => sum + (t.sleeve || 0),
      0
    );

    // 2️⃣ total splicing from otherTasks
    const totalSplicing = otherTasks
      .filter((t) => t.task_type === "Splicing")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // 3️⃣ combined sleeve
    const totalSleeve = totalSleeveFromNormal + totalSplicing;

    // 4️⃣ add/update Sleeve row in merged summary
    merged["Sleeve"] = {
      unit: totalSleeve,
      subtotal: totalSleeve * 700, // price per sleeve
    };

    // calculate subtotal, VAT, total
    const subtotal = Object.values(merged).reduce(
      (sum, v) => sum + v.subtotal,
      0
    );
    const vat = subtotal * 0.18;
    const total = subtotal + vat;

    return { counts: merged, subtotal, vat, total };
  }, [summaryNormal, summaryOther, normalTasks, otherTasks]);

  const exportToExcel = () => {
    if (!selectedMonth) {
      alert("Please select a month to export.");
      return;
    }

    // Convert month number to name
    const monthName = new Date(0, selectedMonth - 1).toLocaleString("default", {
      month: "long",
    });
    const year = new Date().getFullYear(); // or set dynamically if needed

    // 1️⃣ Prepare data for sheets
    const normalData = normalTasks.map((t) => ({
      "Building Name": t.building_name,
      Location: t.building_location,
      Customer: t.customer_name,
      Account: t.account_number,
      "Serial No": t.serial_number,
      Date: t.installation_date,
      "Case Ticket": t.case_ticket,
      "Cable Type": t.cable_type,
      "Cable Used (m)": t.cable_used,
      ORM1: t.orm1,
      ONT: t.ont,
      Sleeve: t.sleeve,
      Task: t.task_type,
      Price: t.price,
    }));

    const otherData = otherTasks.map((t) => ({
      "Building Name": t.building_name,
      Task: t.task_type,
      Amount: t.amount,
      Price: t.price,
    }));

    const summaryData = [
      ...Object.entries(combinedSummary.counts).map(([task, val]) => ({
        Task: task,
        Unit: val.unit,
        Subtotal: val.subtotal,
      })),
      { Task: "Subtotal", Unit: "", Subtotal: combinedSummary.subtotal },
      { Task: "VAT (18%)", Unit: "", Subtotal: combinedSummary.vat },
      { Task: "Total", Unit: "", Subtotal: combinedSummary.total },
    ];

    // 2️⃣ Create workbook and sheets
    const wb = XLSX.utils.book_new();
    const normalSheetName = `GPON-${monthName}-${year}`;
    const normalSheet = XLSX.utils.json_to_sheet(normalData);
    const otherSheet = XLSX.utils.json_to_sheet(otherData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    XLSX.utils.book_append_sheet(wb, normalSheet, normalSheetName);
    XLSX.utils.book_append_sheet(wb, otherSheet, "FDT & FDB");
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // 3️⃣ Write file
    XLSX.writeFile(
      wb,
      `Contractor_Completion_Report_${monthName}_${year}.xlsx`
    );
  };

  return (
    <div className="text-gray-700 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">
            Contractor Completion Report
          </h1>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          >
            Export to Excel
          </button>
        </div>

        {/* Admin filters */}
        {(user?.user_type === "admin" ||
          user?.user_type === "admin_contractor") && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Month selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 rounded border"
            >
              <option value="">Select Month</option>
              {[...Array(12).keys()].map((m) => (
                <option key={m + 1} value={m + 1}>
                  {new Date(0, m).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            {/* Contractor selector only for full admin */}
            {user?.user_type === "admin" && (
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="p-2 rounded border"
              >
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractor_company_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() =>
                fetchData(
                  selectedMonth,
                  user?.user_type === "admin_contractor"
                    ? user.contractor_id
                    : selectedContractor
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={
                !selectedMonth ||
                (user?.user_type === "admin" && !selectedContractor) ||
                loading
              }
            >
              {loading ? "Loading..." : "Load Report"}
            </button>
          </div>
        )}

        {loadData && (
          <div>
            <Slider
              dots={true}
              infinite={false}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {/* Slide 1: Normal Tasks */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
                  UNIT UPLINKING AND TROUBLESHOOTING
                </h2>
                <Table
                  columns={normalColumns}
                  data={normalTasks}
                  className="dark:text-gray-200"
                />
              </div>

              {/* Slide 2: Other Tasks */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
                  FDT & FDB
                </h2>
                <Table
                  columns={otherColumns}
                  data={otherTasks}
                  className="dark:text-gray-200"
                />
              </div>

              {/* Slide 3: Summary */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-3 dark:text-gray-200">
                  Summary
                </h2>
                <table className="w-full text-sm border-collapse dark:text-gray-200">
                  <thead className="dark:bg-gray-700">
                    <tr>
                      <th className="border px-2 py-1">Task</th>
                      <th className="border px-2 py-1">Unit</th>
                      <th className="border px-2 py-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(combinedSummary.counts).map(([tt, val]) => (
                      <tr key={tt} className="dark:border-gray-600">
                        <td className="border px-2 py-1">{tt}</td>
                        <td className="border px-2 py-1">{val.unit}</td>
                        <td className="border px-2 py-1">
                          {val.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 dark:text-gray-200">
                  <p>Subtotal: {combinedSummary.subtotal.toLocaleString()}</p>
                  <p>VAT (18%): {combinedSummary.vat.toLocaleString()}</p>
                  <p className="font-bold">
                    Total: {combinedSummary.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </Slider>
          </div>
        )}
      </main>
    </div>
  );
};

export default Completion;
