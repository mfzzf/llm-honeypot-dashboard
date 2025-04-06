import React from 'react';
import ReactECharts from 'echarts-for-react';

const BarChart = ({ 
  title, 
  data, 
  xAxisData, 
  yAxisName, 
  onClickItem,
  color = ['#1890ff', '#36cfc9'],
  showBackground = false,
  horizontal = false
}) => {
  // 动态设置坐标轴
  const xAxisOption = horizontal 
    ? {
        type: 'value',
        name: yAxisName,
        nameLocation: 'middle',
        nameGap: 30,
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
      }
    : {
        type: 'category',
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          rotate: 30,
          interval: 0,
          color: '#666',
          formatter: function(value) {
            // 长字符串截断
            if (value && value.length > 12) {
              return value.substring(0, 10) + '...';
            }
            return value;
          }
        }
      };
  
  const yAxisOption = horizontal
    ? {
        type: 'category',
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          color: '#666',
          formatter: function(value) {
            // 长字符串截断
            if (value && value.length > 15) {
              return value.substring(0, 12) + '...';
            }
            return value;
          }
        }
      }
    : {
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
      };

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
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    grid: {
      left: horizontal ? '15%' : '3%', 
      right: '4%',
      bottom: horizontal ? '3%' : '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: xAxisOption,
    yAxis: yAxisOption,
    series: [
      {
        name: title,
        type: 'bar',
        data: data,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: horizontal ? 1 : 0,
            y2: horizontal ? 0 : 1,
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
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10
          }
        },
        showBackground: showBackground,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.1)'
        }
      }
    ],
    animation: true
  };

  const onEvents = {
    'click': (params) => {
      if (onClickItem && typeof onClickItem === 'function') {
        const index = horizontal ? params.encode.y[0] : params.encode.x[0];
        onClickItem(xAxisData[index]);
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

export default BarChart; 