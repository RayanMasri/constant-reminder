import React from 'react';
import { hoursToReadable } from '../../../utility.js';

export default function Item(props) {
  return (
    <div
      className="item-disabled"
      style={{
        backgroundColor: '#848383',
        width: '480px',
        color: 'black',
      }}
    >
      <div className="left">
        <div className="hours">{hoursToReadable(props.hours)}</div>
        <div className="task">{props.task}</div>
      </div>
      {props.task.trim() && (
        <div className="right">
          <div className="productive">
            Productive:{' '}
            {props.productive == null
              ? 'Not decided yet'
              : props.productive
              ? 'Yes'
              : 'No'}
          </div>
          <div className="completed">
            Completed:{' '}
            {props.completed == null
              ? 'Not decided yet'
              : props.completed
              ? 'Yes'
              : 'No'}
          </div>
        </div>
      )}
    </div>
  );
}
