import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import Item from './Item.jsx';

export default function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const style = {
    width: '480px',
    backgroundColor: 'transparent',
    height: 'max-content',
    userSelect: 'none',
    fontFamily: 'Segoe UI Regular',
    fontSize: '16px',
    marginBottom: '15px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Item
        task={props.task}
        hours={props.hours}
        id={props.id}
        isOver={isOver}
        onExtend={props.onExtend}
        onClose={props.onClose}
        onChange={props.onChange}
      />
    </div>
  );
}
