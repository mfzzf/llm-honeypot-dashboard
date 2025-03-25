import React from 'react';
import ReactECharts from 'echarts-for-react';

const PieChart = ({ title, data, onClickItem }) => {
  const option = {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };

  const onEvents = {
    'click': (params) => {
      if (onClickItem && typeof onClickItem === 'function') {
        onClickItem(params.name);
      }
    }
  };

  return <ReactECharts 
    option={option} 
    style={{ height: '300px' }} 
    onEvents={onEvents}
  />;
};

export default PieChart; 