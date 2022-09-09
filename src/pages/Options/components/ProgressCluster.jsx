import React, { useState, useEffect } from 'react';
import DecreaseIcon from './DecreaseIcon.jsx';
import IncreaseIcon from './IncreaseIcon.jsx';
import CircleProgress from './CircleProgress.jsx';
import { Divider } from '@mui/material';

export default function ProgressCluster(props) {
  const [state, setState] = useState({
    initial: true,
  });

  useEffect(() => {
    setState({
      ...state,
      initial: false,
    });
  }, []);

  return (
    <div className="progress-cluster">
      <CircleProgress
        value={state.initial ? 0 : props.value}
        radius={props.radius}
        bg={props.bg}
        fg={props.fg}
        label={props.label}
        style={{
          marginBottom: '15px',
        }}
      />
      {props.nested.map((group, index) => {
        return (
          <div
            className="info-group"
            style={{
              width: '100%',
            }}
            key={`${props.label}-${index}`}
          >
            <Divider
              sx={{
                width: '100%',
                borderColor: '#414141',
                borderBottomWidth: 2,
              }}
            />
            <div className="info">
              <div className="label">{group.title}</div>
              <div className="value">
                {group.direction != null &&
                  (group.direction ? <IncreaseIcon /> : <DecreaseIcon />)}
                <div className="number">{group.value}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* <Divider
        sx={{
          width: '286px',
          borderColor: '#414141',
          borderBottomWidth: 2,
          mt: '15px',
        }}
      />
      <div className="info">
        <div className="label">viewpoints received</div>
        <div className="value">
          <div className="number">350</div>
        </div>
      </div> */}
      {/* <Divider
        sx={{
          width: '286px',
          borderColor: '#414141',
          borderBottomWidth: 2,
        }}
      />
      <div className="info">
        <div className="label">productive tasks</div>
        <div className="value">
          <IncreaseIcon />
          <div className="number">230</div>
        </div>
      </div>
      <Divider
        sx={{
          width: '286px',
          borderColor: '#414141',
          borderBottomWidth: 2,
        }}
      />
      <div className="info">
        <div className="label">wastes of time</div>
        <div className="value">
          <DecreaseIcon />
          <div className="number">120</div>
        </div>
      </div> */}
    </div>
  );
}
