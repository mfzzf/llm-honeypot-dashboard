import React from 'react';
import ReactECharts from 'echarts-for-react';

const LineChart = ({ title, data, xAxisData, yAxisName, seriesName }) => {
  const option = {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        data: data,
        smooth: true,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '300px' }} />;
};

export default LineChart; 