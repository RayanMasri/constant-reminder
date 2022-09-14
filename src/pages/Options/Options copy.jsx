import React, { useState, useEffect } from 'react';
import './Options.css';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
// import 'chartjs-adapter-date-fns';
import { getParsedTime } from '../../utility.js';

export default function Options(props) {
  const [state, setState] = useState({
    data: {
      completed: [],
      productive: [],
    },
    // completed: [0, 10, 5, 2, 20, 30, 45],
    // productive: [0, 10, 5, 2, 20, 30, 45],
    // labels: ['Jun', 'Jul', 'Aug'],
    labels: [],
  });

  useEffect(() => {
    const getHistory = async () => {
      let { history } = await chrome.storage.local.get('history');

      // let edited = {
      //   completed: [0],
      //   productive: [0],
      // };
      // for (let item of history) {
      //   let value =
      //     edited[item.answerTo][edited[item.answerTo].length - 1] +
      //     (item.answer ? 1 : -1);
      //   edited[item.answerTo].push(value);
      // }

      let completed = history.filter((item) => item.answerTo == 'completed');

      let data = [];
      for (let item of completed) {
        let value =
          (data[data.length - 1] || { value: 0 }).value +
          (item.answer ? 1 : -1);
        data.push({
          value: value,
          task: item.task,
          date: item.answerDate,
        });
      }

      setState({
        ...state,
        // completed: edited.completed,
        // productive: edited.productive,
        data: {
          ...state.data,
          completed: data,
        },
        // labels: completed.map((e) => {
        //   let { day, month } = getParsedTime(new Date(e.answerDate));
        //   return `${month}/${day}`;
        // }),
        // labels: completed.map((e) => e.answerDate),
        labels: completed.map((e) => e.answerDate),
      });
    };

    getHistory().catch(console.error);
  }, []);

  return (
    <div className="app">
      <div className="chart-container">
        <Chart
          type="line"
          data={{
            datasets: [
              {
                label: 'Tasks completed',
                backgroundColor: 'rgb(40, 99, 90)',
                borderColor: 'rgb(40, 99, 90)',

                data: [
                  {
                    t: '2015-03-15T13:03:00Z',
                    y: 12,
                  },
                  {
                    t: '2015-03-25T13:02:00Z',
                    y: 21,
                  },
                  {
                    t: '2015-04-25T14:12:00Z',
                    y: 32,
                  },
                ],

                // data: state.data.completed.map((item) => {
                //   return {
                //     t: item.date,
                //     y: item.value,
                //   };
                // }),
              },
              // {
              //   label: 'John',
              //   backgroundColor: 'rgb(255, 99, 90)',
              //   borderColor: 'rgb(255, 99, 90)',
              //   data: state.productive,
              // },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            // scales: {
            //   x: {
            //     type: 'time',
            //     time: {
            //       unit: 'month',
            //     },
            //   },
            // },
            //   scales: {
            //     x: {
            //       type: 'time',
            //     },
            //   },
            //   plugins: {
            //     tooltip: {
            //       displayColors: false,
            //       callbacks: {
            //         label: function (context) {
            //           if (context.dataset.label == 'Tasks completed') {
            //             return state.data.completed[context.parsed.x].task;
            //           }
            //         },
            //         title: function (tooltipItem, data) {
            //           return;
            //         },
            //       },
            //     },
            //     legend: {
            //       labels: {
            //         boxWidth: 0,
            //       },
            //     },
            //   },
          }}
        />
      </div>
    </div>
  );
}
