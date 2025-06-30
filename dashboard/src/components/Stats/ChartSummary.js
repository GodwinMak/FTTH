import React, { useEffect } from "react";
import Chart from "react-apexcharts";

const ChartSummary = ({ darkMode, data }) => {
  useEffect(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

  const seriesData = data?.monthlyCompletedAccepted?.map(item => item.count) || [];
  const categories = data?.monthlyCompletedAccepted?.map(item => {
    const date = new Date(item.month + "-01");
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  }) || [];


  const chartConfig = {
    series: [
      {
        name: "Completed (Accepted)",
        data: seriesData,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 240,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#020617"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 2,
        },
      },
      xaxis: {
        categories,
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: {
            colors: darkMode ? "#dddddd" : "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: darkMode ? "#dddddd" : "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#a0a0a0",
        strokeDashArray: 5,
        xaxis: { lines: { show: true } },
        padding: { top: 5, right: 20 },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    },
  };

  return (
    <div className="px-2 pb-0">
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="bar"
        height={240}
      />
    </div>
  );
};

export default ChartSummary;
