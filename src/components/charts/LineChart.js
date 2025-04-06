import React from 'react';
import ReactECharts from 'echarts-for-react';

const LineChart = ({ 
  title, 
  data, 
  xAxisData, 
  yAxisName, 
  seriesName, 
  color = ['#1890ff', '#36cfc9'], 
  smooth = false, 
  showArea = false 
}) => {
  // 创建渐变色
  const areaStyle = showArea ? {
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: color[0] // 渐变起始色
          },
          {
            offset: 1,
            color: 'rgba(255, 255, 255, 0.1)' // 渐变结束色
          }
        ],
        global: false
      }
    }
  } : {};

  const option = {
    title: {
      text: title,
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: '#f0f0f0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: color[0],
          opacity: 0.5
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5'
        }
      }
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        data: data,
        smooth: smooth,
        symbol: 'emptyCircle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: color[0]
              },
              {
                offset: 1,
                color: color[1] || color[0]
              }
            ]
          }
        },
        itemStyle: {
          color: color[0],
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            borderColor: color[0],
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10
          }
        },
        ...areaStyle
      }
    ],
    animation: true
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height: '300px', width: '100%' }} 
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default LineChart; 