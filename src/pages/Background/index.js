import { v4 as uuidv4 } from './uuid.min.js';
import {
  hoursToReadable,
  getMaximumHour,
  getMinimumHour,
  getFormattedDate,
  getHourTotal,
  minutesToTime,
  getParsedTime,
  getLongDay,
} from '../../utility.js';

// when showing freetime show which after task and correct hour data *
// context text in notification show correct task time *

// fix: dont show freetime when both task and the next due task are in the past *

const generateDefaultItems = () => {
  let { year, month, day, hours: nowHours } = getParsedTime(new Date(), true);

  let items = [];

  for (let i = 6; i <= 24; i++) {
    let time = `${month}/${day}/${year}, ${i}:00:00`;
    let skipped = false;

    if (nowHours >= i + 1) skipped = true;

    let object = {
      time: time,
      skipped: skipped,
      completed: null,
      productive: null,
      hours: [`${i}:00`],
      id: uuidv4(),
      task: '',
    };

    items.push(object);
  }

  return items;
};

console.log(`Started on ${getFormattedDate()}`);

chrome.alarms.getAll((alarms) => {
  if (!alarms.find((alarm) => alarm.name == 'constant-reminder')) {
    console.log('ALARM: Alarm could not be found, creating...');
    chrome.alarms.create('constant-reminder', {
      periodInMinutes: 1,
    });
  } else {
    console.log('ALARM: Alarm already exists');
  }
});

const resetData = () => {
  console.log(`APP: Reset day to ${getLongDay()} and set default items`);
  chrome.storage.local.set({ day: new Date().getDay() });
  chrome.storage.local.set({ items: generateDefaultItems() });
};

const askCompleted = (id, task, hours) => {
  console.log(`NOTIFICATION: Asking for completion from user`);

  chrome.notifications.clear(id);
  chrome.notifications.create(id, {
    buttons: [{ title: 'Yes' }, { title: 'No' }],
    message: `Did you finish "${task}"?`,
    title: 'Did you?',
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon-128.png'),
    contextMessage: `Task at ${hoursToReadable(hours)}`,
    priority: 2,
    requireInteraction: true,
  });
};

const askProductive = (id, task, hours) => {
  console.log(`NOTIFICATION: Asking for viewpoint on task from user`);

  chrome.notifications.clear(id);
  chrome.notifications.create(id, {
    buttons: [{ title: 'Productive' }, { title: 'A waste of time' }],
    message: `What do you consider "${task}" to be?`,
    title: 'Was it productive?',
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon-128.png'),
    contextMessage: `Task at ${hoursToReadable(hours)}`,
    priority: 2,
    requireInteraction: true,
  });
};

const storeInAutoComplete = async (hours, task) => {
  let { autocompletion } = await chrome.storage.local.get('autocompletion');
  if (!autocompletion) autocompletion = {};

  for (let hour of hours) {
    if ((autocompletion[hour] || []).includes(task)) continue;
    autocompletion[hour] = [...(autocompletion[hour] || []), task];
  }

  chrome.storage.local.set({ autocompletion: autocompletion });
};

// Refactored
const alarmIteration = async () => {
  // Get day from storage
  let { day } = await chrome.storage.local.get('day');
  // If day is empty or day does not equal the current day, reset items
  if (!day || new Date().getDay() != day) return resetData();

  // Get items from storage
  let { items } = await chrome.storage.local.get('items');
  items = items.map((item) => {
    // Return same item if skipped
    if (item.skipped) return item;

    // If completion decision was not taken
    if (item.completed == null) {
      // Check if the maximum hour + one hour is >= the current time
      let maximum = getMaximumHour(item.hours);
      let addition = parseInt(maximum.split(':')[0]) + 1;
      let { hours } = getParsedTime(new Date(), true);

      // If it isn't, do nothing
      if (hours < addition) return item;

      // If task is empty, skip item
      if (!item.task.trim()) return { ...item, skipped: true };

      // Store task name to all hours in autocompletion
      storeInAutoComplete(item.hours, item.task);

      // Ask if task was done
      askCompleted(item.id, item.task, item.hours);
    } else {
      // Otherwise, check if productive decision was not taken, if wasn't, ask for it
      if (item.productive == null)
        askProductive(item.id, item.task, item.hours);
    }

    return item;
  });

  chrome.storage.local.set({ items: items });
};

alarmIteration();
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(`Alarm ran at ${getFormattedDate()}`);
  alarmIteration();
});

// Refactored
const showFreetime = async (id) => {
  let { hours: nowHours, minutes: nowMinutes } = getParsedTime(
    new Date(),
    true,
    true
  );

  let { items } = await chrome.storage.local.get('items');
  let item = items.find((item) => item.id == id);
  let maximum = getMaximumHour(item.hours);

  // Find any tasks that are between this hour and this hour + 61 minutes
  // e.g: ['6:00', '7:01'] // null
  // e.g: ['6:00 -> 10:00', '10:30', '11:00'] // 10:30 or 11:00
  let due = items.find((other) => {
    if (other.id == id) return false;
    let minimum = getMinimumHour(other.hours);
    if (getHourTotal(minimum) <= getHourTotal(maximum)) return false;
    return getHourTotal(minimum) - getHourTotal(maximum) <= 60;
  });

  // If there are any due tasks, user has no freetime
  if (due) return;

  // Filter items by minimum hours that are greater than the maximum hour by the due period,
  // and sort ascendingly from minimum hour
  let filtered = items
    .filter((other) => {
      return (
        getHourTotal(getMinimumHour(other.hours)) - getHourTotal(maximum) > 60
      );
    })
    .sort((a, b) => {
      let aMin = getMinimumHour(a.hours);
      let bMin = getMinimumHour(b.hours);

      return getHourTotal(aMin) - getHourTotal(bMin);
    });

  // Get minimum from the minimum of each item
  let minimumDue = getMinimumHour(
    filtered.map((other) => getMinimumHour(other.hours))
  );

  // Check if the minimum due is less than or equals this current time,
  // which means it is currently in the past (the user left the computer on sleep for a few hours)
  if (getHourTotal(minimumDue) <= nowHours * 60 + nowMinutes) return;

  // Get amount of freetime by subtracting from the minimum due to this time
  let freetime = getHourTotal(minimumDue) - (nowHours * 60 + nowMinutes);

  // Format into string
  let [hours, minutes] = minutesToTime(freetime);
  let strings = [];
  if (hours > 0) strings.push(`${hours} hour(s)`);
  if (minutes > 0) strings.push(`${minutes} minute(s)`);

  // Notify user
  chrome.notifications.create({
    message: `You have ${strings.join(', ')} of freetime`,
    title: 'Freetime',
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icon-128.png'),
    priority: 2,
    contextMessage: `Next task due: "${filtered[0].task}" at ${hoursToReadable(
      filtered[0].hours
    )}`,
  });
};

const getDefaultAnswerObject = () => {
  return {
    answerDate: new Date().toLocaleString('en-US'),
    answerTo: '',
    answer: null,
  };
};

// Refactored
chrome.notifications.onButtonClicked.addListener(async (id, index) => {
  let { items } = await chrome.storage.local.get('items');

  items = await Promise.all(
    items.map(async (item) => {
      if (item.id != id) return item;

      // If decision is not taken, means the value is the answer, otherwise what was set
      let completed = item.completed == null ? index == 0 : item.completed;

      // If completion decision was taken, means the value is the answer, otherwise what was set
      let productive = item.completed != null ? index == 0 : item.productive;

      let skipped = false; // Prevents infinite notifications

      // Add to history
      let answers = [];
      let defaultAnswer = getDefaultAnswerObject();

      // {
      //   "answer": false,
      //   "answerDate": "8/29/2022, 3:22:14 PM",
      //   "answerTo": "productive",
      //   "completed": true,
      //   "hours": ["10:00"],
      //   "id": "051e7066-9be1-4c00-941b-431183951fe9",
      //   "productive": null,
      //   "skipped": false,
      //   "task": "aisjo",
      //   "time": "8/27/2022, 10:00:00"
      // },

      // If completed decision was not taken, means notification was completed decision
      if (item.completed == null) {
        answers.push({
          ...defaultAnswer,
          answerTo: 'completed',
          answer: index == 0,
          completed: completed,
          productive: productive,
        });

        // If answer was yes, ask productivity
        if (index == 0) {
          askProductive(item.id, item.task, item.hours);
        } else {
          // Otherwise, show freetime, and add productive as false
          answers.push({
            ...defaultAnswer,
            answerTo: 'productive',
            answer: false,
            completed: false,
            productive: false,
            skipped: true,
          });
          skipped = true;

          showFreetime(item.id);
        }
      } else {
        // If completed decision was taken, means notification was productivity decision
        console.log(`Pushed productive`);

        answers.push({
          ...defaultAnswer,
          answerTo: 'productive',
          answer: index == 0,
          completed: completed,
          productive: productive,
          skipped: true,
        });
        skipped = true;

        console.log(answers);
        console.log(defaultAnswer);

        // Show freetime
        showFreetime(item.id);
      }

      // let clone = structuredClone(item);

      // item.completed = clone.completed == null ? index == 0 : clone.completed;
      // item.productive =
      //   clone.completed != null
      //     ? !clone.completed
      //       ? false
      //       : index == 0
      //     : clone.productive;

      // answer = {
      //   ...item,
      //   ...answer,
      // };
      // answers.push(answer);

      // {
      //   "answer": false, +
      //   "answerDate": "8/29/2022, 3:22:14 PM", +
      //   "answerTo": "productive", +
      //   "completed": true, *
      //   "hours": ["10:00"], -
      //   "id": "051e7066-9be1-4c00-941b-431183951fe9", -
      //   "productive": null, *
      //   "skipped": false, -
      //   "task": "aisjo", -
      //   "time": "8/27/2022, 10:00:00" -
      // },

      // Push item to history and save
      let { history } = await chrome.storage.local.get('history');
      if (!history) history = [];
      for (let answer of answers) {
        console.log({
          ...item,
          ...answer,
        });
        history.push({
          ...item,
          ...answer,
        });
      }
      chrome.storage.local.set({ history: history });

      // Return item with updated variables
      return {
        ...item,
        completed: completed,
        productive: productive,
        skipped: skipped,
      };
    })
  );

  chrome.storage.local.set({ items: items });
});
