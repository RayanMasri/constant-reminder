import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

export default function PieChart(props) {
  return (
    <div
      style={{
        ...props.style,
      }}
    >
      <Pie
        style={{
          backgroundColor: '#f3f3f3',
          borderRadius: '5px',
          height: '190px',
          ...props.pieStyle,
        }}
        data={{
          labels: props.labels,
          datasets: [
            {
              label: '# of Votes',
              data:
                props.data.reduce((a, b) => a + b) == 0 ? [0, 1] : props.data,
              backgroundColor: props.colors,
              borderWidth: 0,
            },
          ],
        }}
      />
    </div>
  );
}
