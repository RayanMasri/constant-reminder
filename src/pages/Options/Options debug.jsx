import React, { useState, useEffect } from 'react';
import './Options.css';
import 'chart.js/auto';

import { getParsedTime } from '../../utility.js';
import verbs from './verbs.json';
import fake_json from './productive_problem.json';
import { v4 as uuidv4 } from 'uuid';
import PlaySlider from './PlaySlider.jsx';
import Button from '@mui/material/Button';
import LineChart from './LineChart';
import PieChart from './PieChart';

import Menu from './Menu.jsx';

// try filling gaps in productive history by previous value, to mask it and match it with completed in a single chart
// scrap the above, where the dataset points of productive, are not completed, means not productive, so just decrease value
// actually might do the first, because not completing a task is actually not productive

// add custom legend with score as percentage, and a text rating like "Excellent, Could do better, Very bad, Lazy garbage"

// add dropdown menu with 'Past week, Past month, Past year, All time', showing how much the user has grown in each category, completed and producitve
// by  a percentage

// pie chart with waste of time tasks, productive tasks completed tasks, non completed tasks, add overlay on non completed tasks which include waste of time tasks

// add productivity percentage growth over chart

// create an algorithm which creates spaces in seconds between data points, or store data in history in locale string but with milliseconds

// show percentage in pie cahrt

// upload images to adobe xd

// make values never be negative, by adding the lowest part abs to the rest or something like that, just offset by some value to fix it

export default function Options(props) {
  const [state, setState] = useState({
    combined: true,
    history: undefined,
    data: {
      completed: [],
      productive: [],
    },
    // completed: [0, 10, 5, 2, 20, 30, 45],
    // productive: [0, 10, 5, 2, 20, 30, 45],
    // labels: ['Jun', 'Jul', 'Aug'],
    labels: [],
    variables: {
      probabilities: {
        answer: {
          productive: 50,
          completed: 50,
        },
      },
      taskDistance: {
        // in minutes
        min: 30,
        max: 60,
      },
      backperiod: 1,
      regeneration: false,
    },
  });

  const feedback = [
    {
      range: [0, 10],
      info: 'Extremely bad',
    },
    {
      range: [11, 25],
      info: 'Very bad',
    },
    {
      range: [26, 35],
      info: 'Bad',
    },
    {
      range: [36, 50],
      info: 'Decent',
    },
    {
      range: [51, 70],
      info: 'Good',
    },
    {
      range: [71, 85],
      info: 'Very good',
    },
    {
      range: [86, 100],
      info: 'Extremely good',
    },
  ];

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  useEffect(() => {
    const getHistory = async (fake = null) => {
      let history;
      if (fake) {
        history = fake;
      } else {
        let { history: history } = await chrome.storage.local.get('history');
      }

      // let { history } = await chrome.storage.local.get('history');

      let completed = history.filter((item) => item.answerTo == 'completed');
      let productive = history.filter((item) => item.answerTo == 'productive');

      // Make productive answers, the same date as their respective completed answers
      for (let index in productive) {
        let item = productive[index];

        let parent = completed.find((x) => x.id == item.id);
        productive[index].answerDate = parent.answerDate;
      }

      let data_completed = [];
      for (let index in completed) {
        // console.log(completed[index].id);
        // console.log(productive[index].id);
        let item = completed[index];
        let value =
          (
            data_completed[data_completed.length - 1] || {
              // value: item.answer ? -1 : 1,
              value: 0,
            }
          ).value + (item.answer ? 1 : -1);
        data_completed.push({
          value: value,
          answer: item.answer,
          task: item.task,
          date: item.answerDate,
        });
      }

      let data_productive = [];
      for (let item of productive) {
        let value =
          (
            data_productive[data_productive.length - 1] || {
              // value: item.answer ? -1 : 1,
              value: 0,
            }
          ).value + (item.answer ? 1 : -1);
        data_productive.push({
          value: value,
          answer: item.answer,
          task: item.task,
          date: item.answerDate,
        });
      }

      setState({
        ...state,
        data: {
          ...state.data,
          completed: data_completed,
          productive: data_productive,
        },
        labels: completed.map((e) => {
          let { day, month } = getParsedTime(new Date(e.answerDate));
          return `${month}/${day}`;
        }),
        history: history,
      });
    };

    let minAdditive = 1000 * 60 * state.variables.taskDistance.min; // 30 minutes
    let maxAdditive = 1000 * 60 * state.variables.taskDistance.max; // 60 minutes
    let backperiod = 1000 * 60 * 60 * 24 * state.variables.backperiod; // 14 days

    let fake = [];

    for (
      let i = Date.now() - backperiod;
      i <= Date.now();
      i += getRandomArbitrary(minAdditive, maxAdditive)
    ) {
      let answerDate = new Date(i).toLocaleString();
      let completed =
        Math.random() < state.variables.probabilities.answer.completed / 100;

      let pushable = [];

      if (completed) {
        let task = verbs[Math.floor(Math.random() * verbs.length)];
        let main = {
          answer: true,
          answerDate: answerDate,
          id: uuidv4(),
          task: task,
          completed: true,
          productive: null,
          skipped: false,
        };

        pushable.push({
          ...main,
          answerTo: 'completed',
        });

        let productive =
          Math.random() < state.variables.probabilities.answer.productive / 100;
        pushable.push({
          ...main,
          answerTo: 'productive',
          answerDate: new Date(i + 5000).toLocaleString(),
          productive: productive,
          answer: productive,
        });
      } else {
        let task = verbs[Math.floor(Math.random() * verbs.length)];
        let main = {
          answer: false,
          answerDate: answerDate,
          id: uuidv4(),
          task: task,
          completed: false,
          productive: false,
          skipped: false,
        };

        pushable.push({
          ...main,
          answerTo: 'completed',
        });

        pushable.push({
          ...main,
          answerTo: 'productive',
        });
      }

      for (let item of pushable) fake.push(item);
    }
    // console.log(JSON.stringify(fake));

    // getHistory(fake_json).catch(console.error);
    getHistory(fake).catch(console.error);
  }, [JSON.stringify(state.variables)]);

  function index(obj, is, value) {
    if (typeof is == 'string') return index(obj, is.split('.'), value);
    else if (is.length == 1 && value !== undefined) {
      obj[is[0]] = value;
      return obj;
    } else if (is.length == 0) return obj;
    else return index(obj[is[0]], is.slice(1), value);
  }

  const updateProbability = (value, notation) => {
    let arr = structuredClone(state);
    index(arr, notation, value);

    setState(arr);
  };

  const productiveDataset = {
    label: 'Tasks productive',
    id: 'productive',
    backgroundColor: '#DE89BE',
    borderColor: '#DE89BE',
    borderWidth: 2,
    data: state.data.productive.map((item, index) => {
      return {
        x: new Date(item.date).toISOString(),
        y: item.value,
        label: item.task,
      };
    }),
    borderDash: [3, 3],
  };

  const completedDataset = {
    label: 'Tasks completed',
    id: 'completed',
    backgroundColor: '#09814A',
    borderColor: '#09814A',
    borderWidth: 5,
    data: state.data.completed.map((item, index) => {
      return {
        x: new Date(item.date).toISOString(),
        y: item.value,
        label: item.task,
      };
    }),
  };

  const inRange = (n, min, max) => n >= min && n <= max;

  const getProductivityPercentage = () => {
    if (!state.history) return '?';

    let total = state.history.filter(
      (item) => item.answerTo == 'productive'
    ).length;
    let productive = state.history.filter(
      (item) =>
        item.answerTo == 'productive' &&
        item.productive == true &&
        item.completed == true
    ).length;

    let percentage = parseFloat(((productive / total) * 100).toFixed(2));

    return {
      info: `${percentage}%, ${
        feedback.find((item) =>
          inRange(Math.floor(percentage), item.range[0], item.range[1])
        ).info
      }`,
      percentage: percentage,
    };
  };

  const getCompletionPercentage = () => {
    if (!state.history) return '?';

    console.log(state.history);

    let total = state.history.filter(
      (item) => item.answerTo == 'completed'
    ).length;
    let completed = state.history.filter(
      (item) => item.answerTo == 'completed' && item.completed == true
    ).length;

    let percentage = parseFloat(((completed / total) * 100).toFixed(2));

    return {
      info: `${percentage}%, ${
        feedback.find((item) =>
          inRange(Math.floor(percentage), item.range[0], item.range[1])
        ).info
      }`,
      percentage: percentage,
    };
  };

  const getOverallRating = () => {
    if (!state.history) return '?';

    let percentage =
      (getProductivityPercentage().percentage +
        getCompletionPercentage().percentage) /
      2;

    return {
      info: `${percentage}%, ${
        feedback.find((item) =>
          inRange(Math.floor(percentage), item.range[0], item.range[1])
        ).info
      }`,
      percentage: percentage,
    };
  };

  return (
    <div className="app">
      <PieChart
        data={[
          (state.history || []).filter(
            (item) =>
              item.answerTo == 'productive' &&
              item.productive == true &&
              item.completed == true
          ).length,
          (state.history || []).filter(
            (item) =>
              item.answerTo == 'productive' &&
              item.productive == false &&
              item.completed == true
          ).length,
        ]}
        labels={['productive', 'non-productive']}
      />
      {state.combined ? (
        <div className="chart-container">
          <LineChart
            style={{ marginBottom: '25px' }}
            datasets={[productiveDataset, completedDataset]}
          />
        </div>
      ) : (
        <div className="chart-container">
          <LineChart
            style={{ marginBottom: '25px' }}
            datasets={[completedDataset]}
          />
          <LineChart
            style={{ marginBottom: '25px' }}
            datasets={[productiveDataset]}
          />
        </div>
      )}

      <div
        className="sliders"
        style={{
          marginLeft: '25px',
        }}
      >
        <PlaySlider
          title="Probability of task to be considered productive by the user after completion"
          onChange={(value) =>
            updateProbability(
              value,
              'variables.probabilities.answer.productive'
            )
          }
          defaultValue={50}
          indicators={[0, 25, 50, 75, 100]}
          postfix="%"
        />
        <PlaySlider
          title="Probability of task to be completed by the user"
          onChange={(value) =>
            updateProbability(value, 'variables.probabilities.answer.completed')
          }
          defaultValue={50}
          indicators={[0, 25, 50, 75, 100]}
          postfix="%"
        />
        <PlaySlider
          title="Maximum time distance between each task"
          onChange={(value) =>
            updateProbability(value, 'variables.taskDistance.max')
          }
          defaultValue={60}
          indicators={[1, 30, 60, 120, 240]}
          min={1}
          max={240}
          postfix=" min"
        />
        <PlaySlider
          title="Minimum time distance between each task"
          onChange={(value) =>
            updateProbability(value, 'variables.taskDistance.min')
          }
          defaultValue={30}
          indicators={[1, 30, 60, 120, 240]}
          min={1}
          max={240}
          postfix=" min"
        />
        <PlaySlider
          title="Amount of days moved backwards"
          onChange={(value) => updateProbability(value, 'variables.backperiod')}
          defaultValue={1}
          indicators={[1, 7, 14]}
          min={1}
          max={14}
          postfix=" day"
        />
        <Button
          onClick={() => {
            setState({
              ...state,
              variables: {
                ...state.variables,
                regeneration: !state.variables.regeneration,
              },
            });
          }}
        >
          Regenerate
        </Button>
        <Button
          onClick={() => {
            setState({
              ...state,
              combined: !state.combined,
            });
          }}
        >
          {state.combined ? 'Split' : 'Combine'}
        </Button>
        <div
          style={{
            color: 'white',
            fontSize: '20px',
          }}
        >
          Productivity: {getProductivityPercentage().info}
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '20px',
          }}
        >
          Completion: {getCompletionPercentage().info}
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '20px',
          }}
        >
          Overall rating: {getOverallRating().info}
        </div>
      </div>
    </div>
  );
}
