import React, { useState, useRef, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import Draggable from './components/Draggable';
import Droppable from './components/Droppable';
import useDidMountEffect from './hooks/useDidMountEffect.jsx';
import DisabledItem from './components/DisabledItem';
import './Popup.css';
import {
  getMaximumHour,
  getMinimumHour,
  getHourTotal,
  minutesToTime,
  getLongDay,
} from '../../utility.js';

// Show next task after asking for productiviity and completion, or show remaining tasks ?
// Should the user be reminded after not completing the task ?
// Should the next due tasks be shown after answering questions? and if there is a freetime, should they still be shown ?

// Integrate auto completion
// Create graph for history

const Popup = () => {
  const [state, setState] = useState({
    items: [],
    selected: null,
  });

  useDidMountEffect(() => {
    chrome.storage.local.set({ items: state.items });
  }, [JSON.stringify(state.items)]);

  useEffect(() => {
    chrome.storage.local.get(['items'], (result) => {
      if (!result.items) return;

      setState({
        ...state,
        items: result.items,
      });
    });
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    setState({
      ...state,
      selected: active.id,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id == over.id)
      return setState({ ...state, selected: false });

    let merger = state.items.findIndex((item) => item.id == over.id);
    let mergee = state.items.findIndex((item) => item.id == active.id);

    let newItems = state.items;

    let tasks = [state.items[merger].task, state.items[mergee].task];
    tasks = tasks.filter((e) => e.trim());

    newItems[merger] = {
      ...state.items[merger],
      hours: state.items[merger].hours.concat(state.items[mergee].hours),
      task: `${tasks.join(' & ')}`,
    };
    newItems.splice(mergee, 1);

    setState({
      ...state,
      items: newItems,
      selected: false,
    });
  };

  const onClose = (id) => {
    if (state.selected) return;
    setState({
      ...state,
      items: state.items.filter((item) => item.id != id),
    });
  };

  const onExtend = (id) => {
    if (state.selected) return;

    let index = state.items.findIndex((item) => item.id == id);
    // Get maximum hour
    let maximum = getMaximumHour(state.items[index].hours);
    let [hours, minutes] = minutesToTime(getHourTotal(maximum) + 30, true);

    let { year, month, day } = getParsedTime(new Date());

    state.items.splice(index + 1, 0, {
      completed: null,
      productive: null,
      skipped: false,
      hours: [`${hours}:${minutes}`],
      task: state.items[index].task,
      id: uuidv4(),
      time: `${month}/${day}/${year}, ${hours}:${minutes}:00`,
    });

    setState({
      ...state,
      items: state.items,
    });
  };

  const onChange = (event, id) => {
    console.log(event);
    console.log(id);
    setState({
      ...state,
      items: state.items.map((item) => {
        if (item.id == id) {
          return {
            ...item,
            task: event.target.value,
          };
        }
        return item;
      }),
    });
  };

  const pushDownDone = (items) => {
    let done = items
      .filter(
        (item) =>
          item.skipped || item.completed != null || item.productive != null
      )
      .sort((a, b) => {
        return (
          getHourTotal(getMinimumHour(b.hours)) -
          getHourTotal(getMinimumHour(a.hours))
        );
      });

    let notDone = items.filter(
      (item) =>
        !item.skipped && item.completed == null && item.productive == null
    );

    return [...notDone, ...done];
  };

  return (
    <div className="main">
      {/* <svg className="background"></svg> */}

      <div className="top">
        {/* <img src={require('../../assets/img/icon-34.png')}></img> */}
        <div className="title">
          <div className="text">What's your schedule today?</div>
        </div>
        <div className="day">{getLongDay()}</div>
      </div>
      <div className="content">
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            {pushDownDone(state.items).map((item) => {
              if (
                item.skipped ||
                item.completed != null ||
                item.productive != null
              ) {
                return (
                  <DisabledItem
                    hours={item.hours}
                    task={item.task}
                    productive={item.productive}
                    completed={item.completed}
                    key={item.id}
                  />
                );
              }

              const Which =
                state.selected && state.selected != item.id
                  ? Droppable
                  : Draggable;

              return (
                <Which
                  hours={item.hours}
                  task={item.task}
                  key={item.id}
                  id={item.id}
                  onExtend={() => onExtend(item.id)}
                  onClose={() => onClose(item.id)}
                  onChange={(event) => onChange(event, item.id)}
                />
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default Popup;
