import React, { useState, useEffect } from 'react';
import { getParsedTime } from '../../utility.js';
import { v4 as uuidv4 } from 'uuid';
import verbs from './verbs.json';
import LineChart from './components/LineChart.jsx';
import PieChart from './components/PieChart.jsx';
import DateMenu from './components/DateMenu.jsx';
import InfoTopLeft from './components/InfoTopLeft.jsx';
import CircleProgress from './components/CircleProgress.jsx';
import { Divider } from '@mui/material';

import IncreaseIcon from './components/IncreaseIcon.jsx';
import DecreaseIcon from './components/DecreaseIcon.jsx';
import ProgressCluster from './components/ProgressCluster.jsx';
import './Options.css';

import useDidMountEffect from './hooks/useDidMountEffect.jsx';

import {
  sliceLatest,
  getDayStart,
  getDayEnd,
  getDoneDaysFromTo,
} from './history.js';

// create an algorithm which creates spaces in seconds between data points, or store data in history in locale string but with milliseconds
// store data in history in locale string but with milliseconds

// create a different module called history parser, which has custom functions for parsing state.history

export default function Options(props) {
  const [state, setState] = useState({
    combined: true,
    history: [],
    data: {
      completed: [],
      productive: [],
    },
    dateRange: 0,
    initial: true,

    // completed: [0, 10, 5, 2, 20, 30, 45],
    // productive: [0, 10, 5, 2, 20, 30, 45],
    // labels: ['Jun', 'Jul', 'Aug'],
    labels: [],
    variables: {
      probabilities: {
        answer: {
          productive: 90,
          completed: 100,
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
    perm: [],
  });

  const dateRanges = [7, 30, 365];
  const dateRangeAll = 3;

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  const generateFakeHistory = () => {
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

    return fake;
  };

  const resetHistory = async (fake = null) => {
    let { history } = await chrome.storage.local.get('history');

    if (fake) history = fake;

    history = history || [];

    // console.log(history);
    // console.log(history);
    // let history = await chrome.storage.local.get('history');
    // history = history.history;
    // console.log(a);
    console.log(history);

    if (state.dateRange != dateRangeAll) {
      let latest = sliceLatest(history, dateRanges[state.dateRange]); // Get latest group of tasks according to range, ( e.g: 7 -> gets the all tasks in the last 7 days )

      // If group contains only two response (productive and completed), try increasing, since it only shows two datapoints on top of each other
      if (latest.length <= 2) {
        console.log('yeah ');
        // Map through all ascending date ranges, and see if they are empty too
        for (let i = state.dateRange + 1; i < dateRangeAll; i++) {
          latest = sliceLatest(history, dateRanges[i]);
          if (latest.length != 0) break;
        }

        // If still empty, set to everything in history
        if (latest.length <= 2) latest = history;
      }

      history = latest;
    }

    // console.log(history);

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
      initial: false,
    });
  };

  useEffect(() => {
    let fake = generateFakeHistory();

    setState({
      ...state,
      variables: {
        probabilities: {
          answer: {
            productive: 50,
            completed: Math.random() * 100,
          },
        },
        taskDistance: {
          // in minutes
          min: 30,
          max: 60,
        },
        backperiod: 14,
        regeneration: false,
      },
      perm: fake,
    });

    // console.log(JSON.stringify(fake));

    // getHistory(fake_json).catch(console.error);
    // resetHistory(fake).catch(console.error);
  }, []);

  useDidMountEffect(() => {
    // resetHistory(state.perm);
    resetHistory();
  }, [state.dateRange]);

  useDidMountEffect(() => {
    // resetHistory(state.perm);
    resetHistory();
  }, [state.perm]);

  const getTaskFrequency = (most = true) => {
    if (state.history.length == 0) return 'NO TASKS YET';

    // seperate history items into { task, id } objects
    let tasks = state.history.map((item) => {
      return {
        task: item.task,
        id: item.id,
      };
    });

    // remove items that duplicate with id
    tasks = tasks
      .filter(
        (item, index) =>
          tasks.findIndex((_item) => _item.id == item.id) != index
      )
      .map((item) => item.task);

    // count duplicate tasks
    let counts = {};
    tasks.forEach((x) => {
      counts[x] = (counts[x] || 0) + 1;
    });

    // sort duplicate task count
    counts = Object.entries(counts).sort((a, b) =>
      most ? b[1] - a[1] : a[1] - b[1]
    );

    // get maximum/minimum duplicate, and filter all duplicate counts
    counts = counts.filter(([task, count]) => count == counts[0][1]);

    // map through each task, and find latest date where it was answered to
    counts = counts.map(([task, _]) => {
      // filter items in history with same task
      let filtered = state.history.filter((item) => item.task == task);

      // get unix timestamps, and sort them descendingly
      filtered = filtered
        .map((item) => {
          return {
            task: item.task,
            unix: Date.parse(item.answerDate),
          };
        })
        .sort((a, b) => (most ? b.unix - a.unix : a.unix - b.unix));

      // get maximum/minimum time stamp
      let maximum = filtered[0].unix;

      return {
        task: task,
        unix: maximum,
      };
    });

    // sort tasks latest/oldest answered to get latest task
    counts = counts.sort((a, b) => (most ? b.unix - a.unix : a.unix - b.unix));

    return counts[0].task;
  };

  // const getDay = (date) => {
  //   var month = date.getUTCMonth() + 1; //months from 1-12
  //   var day = date.getUTCDate();
  //   var year = date.getUTCFullYear();
  //   return `${year}/${month}/${day}`;
  // };

  const getStreak = (productive) => {
    if (state.history.length == 0) return 'NO TASKS YET';

    const answerTo = productive ? 'productive' : 'completed';

    // get non-productive answers, by checking if the answer is not productive, and the task it self was completed
    let wastes = state.history.filter(
      (item) =>
        item.answerTo == answerTo &&
        item.answer == false &&
        (productive ? item.completed : true)
    );
    // let wastes = state.history.filter(
    // (item) => item.answerTo == 'completed' && item.answer == false
    // );

    let streak = state.history;

    if (wastes.length > 0) {
      // get latest
      let latest = wastes.sort(
        (a, b) => Date.parse(b.answerDate) - Date.parse(a.answerDate)
      )[0];

      let index = state.history.findIndex(
        (item) => item.id == latest.id && item.answerTo == answerTo
      );

      // get index of the latest, and slice from that index to the last
      streak = state.history.slice(index);
    }

    streak = streak
      .filter((item) => item.answerTo == answerTo && item.answer)
      .sort((a, b) => Date.parse(a.answerDate) - Date.parse(b.answerDate));

    if (streak.length < 1) return '0 days';

    const firstDate = new Date(Date.parse(streak[0].answerDate));

    const doneDays = getDoneDaysFromTo(getDayStart(firstDate, false));

    // doneDays = doneDays.map((day) => {
    //   return {
    //     day: day,
    //     activity: false,
    //   };
    // });

    let latestNonActivity = -1;

    // Move through done days from reverse, check if day doesn't have an activity, if so set index
    for (let index in doneDays) {
      let doneDay = doneDays[doneDays.length - 1 - index];

      console.log(doneDay);

      let activity = false;
      let end = getDayEnd(doneDay);
      let start = Date.parse(doneDay);
      for (let item of streak) {
        console.log(
          Date.parse(item.answerDate) >= start &&
            Date.parse(item.answerDate) <= end
        );
        if (
          Date.parse(item.answerDate) >= start &&
          Date.parse(item.answerDate) <= end
        ) {
          activity = true;
          break;
        }
      }

      if (!activity) {
        latestNonActivity = doneDays.length - 1 - index;
        break;
      }
    }

    if (latestNonActivity < 0) return `${doneDays.length} days`;

    let trueStreak = doneDays.slice(latestNonActivity);

    return `${trueStreak.length} days`;
  };

  const getProductivityLength = () => {
    return state.history.filter(
      (item) =>
        item.answerTo == 'productive' &&
        item.productive == true &&
        item.completed == true
    ).length;
  };
  const getWasteLength = () => {
    return state.history.filter(
      (item) =>
        item.answerTo == 'productive' &&
        item.productive == false &&
        item.completed == true
    ).length;
  };

  const getCompletedLength = () => {
    return state.history.filter(
      (item) => item.answerTo == 'completed' && item.answer
    ).length;
  };
  const getUncompletedLength = () => {
    return state.history.filter(
      (item) => item.answerTo == 'completed' && !item.answer
    ).length;
  };

  return (
    <div className="app">
      <div className="top">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DateMenu
            onChange={(index) => setState({ ...state, dateRange: index })}
            width="970px"
          />
          <Divider
            sx={{
              width: '970px',
              borderColor: '#414141',
              borderBottomWidth: 2,
              my: '30px',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              className="top-left-info-container"
              style={{
                width: 'max-content',
                height: 'max-content',
              }}
            >
              <InfoTopLeft
                label="most repetitive task"
                value={getTaskFrequency()}
              />
              <Divider
                sx={{
                  width: '100%',
                  borderColor: '#414141',
                  borderBottomWidth: 2,
                  my: '10px',
                }}
              />
              <InfoTopLeft
                label="least repetitive task"
                value={getTaskFrequency(false)}
              />
              <Divider
                sx={{
                  width: '100%',
                  borderColor: '#414141',
                  borderBottomWidth: 2,
                  my: '10px',
                }}
              />

              <InfoTopLeft
                label="full productivity streak"
                value={getStreak(true)}
              />
              <Divider
                sx={{
                  width: '100%',
                  borderColor: '#414141',
                  borderBottomWidth: 2,
                  my: '10px',
                }}
              />
              <InfoTopLeft
                label="all completed streak"
                value={getStreak(false)}
              />
            </div>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderRightWidth: 2,
                height: '353px',
                borderColor: '#414141',
                mx: '30px',
              }}
            />

            <ProgressCluster
              value={(
                (getProductivityLength() /
                  (getProductivityLength() + getWasteLength()) || 0) * 100
              ).toFixed(2)}
              label="Productivity"
              bg="white"
              fg="#8D5A97"
              radius={170}
              nested={[
                {
                  title: 'viewpoints received',
                  value: state.history.filter(
                    (item) => item.answerTo == 'productive' && item.completed
                  ).length,
                  direction: null,
                },
                {
                  title: 'productive tasks',
                  value: getProductivityLength(),
                  direction:
                    state.history.length == 0
                      ? null
                      : state.history
                          .filter(
                            (item) =>
                              item.answerTo == 'productive' && item.completed
                          )
                          .slice(-1)
                          .pop().answer == true,
                },
                {
                  title: 'wastes of time',
                  value: getWasteLength(),
                  direction:
                    state.history.length == 0
                      ? null
                      : state.history
                          .filter(
                            (item) =>
                              item.answerTo == 'productive' && item.completed
                          )
                          .slice(-1)
                          .pop().answer == false,
                },
              ]}
            />

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderRightWidth: 2,
                height: '353px',
                borderColor: '#414141',
                mx: '30px',
              }}
            />

            <ProgressCluster
              value={(
                (getCompletedLength() /
                  (getCompletedLength() + getUncompletedLength()) || 0) * 100
              ).toFixed(2)}
              label="Completion"
              bg="white"
              fg="#6BA368"
              radius={170}
              nested={[
                {
                  title: 'tasks submitted',
                  value: state.history.filter(
                    (item) => item.answerTo == 'completed'
                  ).length,
                  direction: null,
                },
                {
                  title: 'completed tasks',
                  value: getCompletedLength(),
                  direction:
                    state.history.length == 0
                      ? null
                      : state.history
                          .filter((item) => item.answerTo == 'completed')
                          .slice(-1)
                          .pop().answer == true,
                },
                {
                  title: 'uncompleted tasks',
                  value: getUncompletedLength(),
                  direction:
                    state.history.length == 0
                      ? null
                      : state.history
                          .filter((item) => item.answerTo == 'completed')
                          .slice(-1)
                          .pop().answer == false,
                },
              ]}
            />
          </div>
        </div>
        <Divider
          orientation="vertical"
          sx={{
            borderRightWidth: 2,
            height: '457px',
            borderColor: '#414141',
            mx: '30px',
          }}
        />
        <PieChart
          pieStyle={{
            backgroundColor: 'transparent',
          }}
          data={[getProductivityLength(), getWasteLength()]}
          labels={['Productive', 'Waste of time']}
          colors={['#8D5A97', '#FFFFFF']}
        />
        <Divider
          orientation="vertical"
          sx={{
            borderRightWidth: 2,
            height: '457px',
            borderColor: '#414141',
            mx: '30px',
          }}
        />
        <PieChart
          pieStyle={{
            backgroundColor: 'transparent',
          }}
          data={[getCompletedLength(), getUncompletedLength()]}
          labels={['Completed', 'Uncompleted']}
          colors={['#6BA368', '#FFFFFF']}
        />
      </div>
      <Divider
        sx={{
          width: '100%',
          borderColor: '#414141',
          borderBottomWidth: 2,
          my: '30px',
        }}
      />
      <LineChart
        style={{ width: '100%', height: '100%' }}
        datasets={[
          {
            label: 'Tasks completed',
            id: 'Completed',
            backgroundColor: '#6BA368',
            borderColor: '#6BA368',
            borderWidth: 5,
            data: state.data.completed.map((item, index) => {
              return {
                x: new Date(item.date).toISOString(),
                y: item.value,
                label: item.task,
              };
            }),
          },
          {
            label: 'Tasks productive',
            id: 'Productive',
            // backgroundColor: 'rgba(222, 137, 190, 0.5)',
            backgroundColor: '#8D5A9780',
            borderColor: '#8D5A97',
            fill: 'origin',
            data: state.data.productive.map((item, index) => {
              return {
                x: new Date(item.date).toISOString(),
                y: item.value,
                label: item.task,
              };
            }),
          },
        ]}
      />
    </div>
  );
}
