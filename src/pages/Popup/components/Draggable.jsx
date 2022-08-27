import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Item from './Item.jsx';

export default function Draggable(props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    backgroundColor: 'transparent',
    width: '480px',
    height: 'max-content',
    userSelect: 'none',
    border: 'none',
    fontFamily: 'Segoe UI Regular',
    fontSize: '16px',
    padding: '0px',
    marginBottom: '15px',
    zIndex: isDragging ? '100' : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Item
        task={props.task}
        hours={props.hours}
        id={props.id}
        listeners={listeners}
        attributes={attributes}
        isDragging={isDragging}
        onExtend={props.onExtend}
        onClose={props.onClose}
        onChange={props.onChange}
      />
    </div>
  );
}
