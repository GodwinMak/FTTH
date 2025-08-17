import React, { useState, useEffect } from "react";
import Cards from "./Cards";
import axios from "axios";
import { PRODUCTION_URL } from "../../utils/Api";
import { useAuthContext } from "../../hooks/useAuthContext";

const ContractorStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loader state

  const { state } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${PRODUCTION_URL}/stats/count/${state.userData.contractor_id}`
        );

        setData([
          {
            title: "In Progress Task",
            value: response.data.inProgress,
            style: { backgroundColor: "#1B946F" },
          },
          {
            title: "On Hold Task",
            value: response.data.onHold,
            style: { backgroundColor: "#41114D" },
          },
          {
            title: "ONT",
            value: response.data.ontCount,
            style: { backgroundColor: "#2E4F08" },
          },
          {
            title: "Drop Cable",
            value: response.data.dropcableCount,
            valuePostfix: "m",
            style: { backgroundColor: "#5a65ff" },
          },
          {
            title: "CAT 6",
            value: response.data.utpCableCount,
            valuePostfix: "m",
            style: { backgroundColor: "#96da45" },
          },
          {
            title: "ATB",
            value: response.data.atbCount,
            style: { backgroundColor: "#fe8f62" },
          },
          { title: "Patch", value: response.data.patchCount, style: { backgroundColor: "#aab63dff" },  },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // ✅ Stop loader after request finishes
      }
    };
    fetchData();
  }, [state]);


  return (
    <div className="p-4 sm:ml-64 mt-14 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <Cards data={data}/>
    </div>
  );
};

export default ContractorStats;
