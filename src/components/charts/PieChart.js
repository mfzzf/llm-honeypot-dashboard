import React from 'react';
import ReactECharts from 'echarts-for-react';

const PieChart = ({ 
  title, 
  data, 
  onClickItem,
  radius = ['50%', '70%'],
  legend = { orient: 'horizontal', left: 'center', bottom: '0%' },
  color = [
    '#1890ff', '#36cfc9', '#ffaa00', '#ff5500', '#9254de',
    '#eb2f96', '#52c41a', '#f5222d', '#faad14', '#13c2c2'
  ]
}) => {
  // 为每个数据项分配颜色
  const processedData = data.map((item, index) => ({
    ...item,
    itemStyle: item.itemStyle || {
      color: color[index % color.length]
    }
  }));

  const option = {
    title: {
      text: title,
      left: 'center',
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      ...legend,
      textStyle: {
        color: '#666'
      },
      data: processedData.map(item => item.name)
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: radius,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: false,
          position: 'outside',
          formatter: '{b}: {d}%',
          color: '#666'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold',
            color: '#333'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false,
          length: 10,
          length2: 10,
          smooth: true
        },
        data: processedData,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
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

  return (
    <ReactECharts 
      option={option} 
      style={{ height: '300px', width: '100%' }} 
      onEvents={onEvents}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default PieChart; 