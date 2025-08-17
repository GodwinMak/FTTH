import React, { useState, useEffect } from "react";
import Card from "./Card";
import DonutChart from "./DonutChart";
import { PRODUCTION_URL } from "../../utils/Api";
import axios from "axios";
import { IoIosPerson, IoIosEyeOff, IoIosPersonAdd } from "react-icons/io";


const Stats = ({ darkMode }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${PRODUCTION_URL}/stats`);
        setData(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const datum = [
    {
      title: "New Installations",
      icon: IoIosPerson,
      count: data.inProgressNewInstallations,
      bgColor: "bg-gray-100",
    },
    {
      title: "Escalation",
      icon: IoIosEyeOff,
      count: data.inProgressTroubleshooting,
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Approvals",
      icon: IoIosPersonAdd,
      count: data.completedTasksInprogress,
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="text-gray-500 bg-gray-100 p-4 sm:ml-64 mt-14 dark:bg-gray-800 min-h-screen">
      {/* Cards and Donut Charts in one flex container */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Cards */}
        <div className="flex flex-col gap-4 lg:flex-1">
          {datum.map((item, index) => (
            <Card key={index} data={item} />
          ))}
        </div>

        {/* Donut Charts */}
        <div className="flex flex-col gap-5 lg:flex-1">
          <DonutChart darkMode={darkMode} data={data} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
