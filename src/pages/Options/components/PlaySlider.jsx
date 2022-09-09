import React from 'react';
import Slider from '@mui/material/Slider';

export default function PlaySlider(props) {
  return (
    <div>
      <div
        style={{
          color: 'white',
        }}
      >
        {props.title}
      </div>
      <Slider
        defaultValue={props.defaultValue}
        onChange={(event) => props.onChange(event.target.value)}
        step={0.1}
        min={0}
        max={props.max || 100}
        marks={props.indicators.map((indicator) => {
          return {
            value: indicator,
            label: `${indicator}${props.postfix || ''}`,
          };
        })}
        sx={{
          color: '#f3f3f3',
        }}
      />
    </div>
  );
}
