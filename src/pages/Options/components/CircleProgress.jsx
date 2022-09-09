import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function CircleProgress(props) {
  return (
    <svg
      width={props.radius}
      height={props.radius}
      viewBox={`0 0 ${props.radius} ${props.radius}`}
      style={props.style || {}}
    >
      <circle
        cx={85}
        cy={85}
        r={props.radius / 2 - props.radius / 20}
        fill="none"
        stroke={props.bg}
        strokeWidth={props.radius / 10}
      />
      <circle
        cx={props.radius / 2}
        cy={props.radius / 2}
        r={props.radius / 2 - props.radius / 20}
        fill="none"
        stroke={props.fg}
        strokeWidth={props.radius / 10}
        pathLength="100"
        strokeDasharray={100}
        strokeDashoffset={100 - props.value}
        transform={`rotate(-90 ${props.radius / 2} ${props.radius / 2})`}
        style={{
          transition: '0.5s cubic-bezier(0, -0.02, 0, 1)',
        }}
      />

      <text
        x="50%"
        y="46%"
        fill="white"
        textAnchor="middle"
        alignmentBaseline="middle"
        style={{
          fontSize: '27px',
        }}
      >
        {props.value}%
      </text>
      <text
        x="50%"
        y="58%"
        fill="#8D8D8D"
        textAnchor="middle"
        alignmentBaseline="middle"
        style={{
          fontSize: '14px',
        }}
      >
        {props.label}
      </text>
    </svg>
  );
}
