import React from 'react';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';

export default function LineChart(props) {
  return (
    <div
      style={{
        height: '250px',
        ...props.style,
      }}
    >
      <Chart
        type="line"
        style={{
          backgroundColor: '#f3f3f3',
          borderRadius: '5px',
        }}
        data={{
          datasets: props.datasets,
          // datasets: props.datasets.map((dataset) => {
          //   if (props.noNegative == undefined || dataset.data.length == 0)
          //     return dataset;

          //   // Get minimum Y value
          //   let offset = Array.from(dataset.data).sort((a, b) => a.y - b.y)[0];
          //   // If the Y value is positive, set offset to zero, otherwise abs of negative offset
          //   offset = offset.y < 0 ? Math.abs(offset.y) : 0;

          //   return {
          //     ...dataset,
          //     data: dataset.data.map((item) => {
          //       return {
          //         ...item,
          //         y: item.y + offset,
          //       };
          //     }),
          //   };
          // }),
        }}
        options={{
          elements: {
            // Bezier curve
            line: {
              tension: 0.4,
            },
          },
          animation: {
            // SLower animation
            duration: 3000,
          },
          // Size control variables
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            // Time cartesian
            x: {
              type: 'time',
              time: {
                unit: 'day',
              },
              ticks: {
                color: '#9DCDC0',
              },
            },
            y: {
              // Hide y-axis that shows values
              beginAtZero: true,
              grid: {
                color: (context) => {
                  if (context.tick.value > 0) {
                    return 'green';
                  } else if (context.tick.value < 0) {
                    return 'red';
                  }

                  return '#000000';
                },
              },
            },
          },
          plugins: {
            tooltip: {
              displayColors: false,
              callbacks: {
                label: (context) => {
                  return `${context.dataset.id}: ${
                    context.raw.label || 'Unknown'
                  }`;
                },
              },
            },
            legend: {
              labels: {
                boxWidth: 0,
                color: '#9DCDC0',
              },
              display: false,
            },
          },
        }}
      />
    </div>
  );
}
