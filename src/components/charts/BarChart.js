import React from 'react';
import ReactECharts from 'echarts-for-react';

const BarChart = ({ title, data, xAxisData, yAxisName, onClickItem }) => {
  const option = {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName
    },
    series: [
      {
        name: title,
        type: 'bar',
        data: data,
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  const onEvents = {
    'click': (params) => {
      if (onClickItem && typeof onClickItem === 'function') {
        onClickItem(xAxisData[params.dataIndex]);
      }
    }
  };

  return <ReactECharts 
    option={option} 
    style={{ height: '300px' }} 
    onEvents={onEvents}
  />;
};

export default BarChart; 