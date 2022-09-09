import React from 'react';

export default function InfoTopLeft(props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '313px',
      }}
      className="top-left-info"
    >
      <div style={{ color: '#7A7A7A', marginBottom: '10px' }}>
        {props.label}
      </div>
      <div>{props.value}</div>
    </div>
  );
}
