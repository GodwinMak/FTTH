import React from 'react';
import Chart from 'react-apexcharts';
import Title from '../ui/Title';

const DonutChart = ({ darkMode, data }) => {
  const inCompleteData = data.incompleteByContractor || [];
  const completeData = data.acceptedByContractor || [];


  const getChartOptions = (dataSet) => ({
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: dataSet.map((item) => item.contractor_name),
    colors: ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD', '#2ECC71'],
    legend: {
      position: 'bottom',
      labels: {
        colors: darkMode ? '#dddddd' : '#000000',
      },
    },
    dataLabels: {
      style: {
        colors: ['#dddddd'],
      },
    },
    noData: {
      text: 'No data',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: darkMode ? '#ffffff' : '#000000',
        fontSize: '16px',
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="py-6 bg-white rounded-lg p-5 flex dark:bg-gray-600 items-center justify-center flex-col">
        <Title>Complete Task</Title>
        <Chart
          options={getChartOptions(completeData)}
          series={completeData.length > 0 ? completeData.map((item) => item.count) : []}
          type="donut"
          height={300}
        />
      </div>
      <div className="py-6 bg-white rounded-lg p-5 flex dark:bg-gray-600 items-center justify-center flex-col">
        <Title>Incomplete Task</Title>
        <Chart
          options={getChartOptions(inCompleteData)}
          series={inCompleteData.length > 0 ? inCompleteData.map((item) => item.count) : []}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
};

export default DonutChart;
