import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { IconButton, TextField, Autocomplete } from '@mui/material';
import MergeIcon from '@mui/icons-material/Merge';
import {
  hoursToReadable,
  getHourTotal,
  getMinimumHour,
  getMaximumHour,
} from '../../../utility.js';

export default function Item(props) {
  const [state, setState] = useState({
    autocomplete: [],
  });

  useEffect(() => {
    chrome.storage.local.get('autocompletion').then(({ autocompletion }) => {
      let minimum = getHourTotal(getMinimumHour(props.hours));
      let maximum = getHourTotal(getMaximumHour(props.hours));

      let collected = [];

      for (let hour of Object.keys(autocompletion)) {
        if (getHourTotal(hour) >= minimum && getHourTotal(hour) <= maximum) {
          collected = collected.concat(autocompletion[hour]);
        }
      }

      setState({
        ...state,
        autocomplete: collected,
      });
    });
  }, []);

  const onChange = (event, value) => {
    props.onChange({
      target: {
        value: value,
      },
    });
  };

  return (
    <div
      className="item"
      style={{
        backgroundColor:
          props.isOver || props.isDragging
            ? props.isDragging
              ? '#787878'
              : '#8B8B8B'
            : '#5B5A5A',
        padding: props.isOver ? '0px' : '10px 10px 0px 10px',
        transition: '0.1s cubic-bezier(0, -0.02, 0, 1)',
      }}
    >
      {!props.isOver ? (
        <div className="sub-item">
          <div className="header">
            <div className="left">
              <div className="hours">{hoursToReadable(props.hours)}</div>
            </div>

            <div className="right">
              <IconButton
                sx={{
                  width: '30px',
                  height: '30px',
                }}
                {...props.listeners}
                {...props.attributes}
              >
                <DragIndicatorIcon
                  sx={{
                    color: 'white',
                    width: '24px',
                    height: '24px',
                  }}
                />
              </IconButton>

              <IconButton
                sx={{
                  width: '30px',
                  height: '30px',
                }}
                onClick={props.onClose}
              >
                <CloseIcon
                  sx={{
                    color: 'white',
                    width: '24px',
                    height: '24px',
                  }}
                />
              </IconButton>
            </div>
          </div>
          <div className="content">
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={state.autocomplete}
              inputValue={props.task}
              onInputChange={onChange}
              disableClearable
              sx={{
                fontFamily: 'Segoe UI Regular',
                mt: '5px',
                color: 'white',
              }}
              ListboxProps={{
                sx: {
                  backgroundColor: '#3d3d3d',
                },
              }}
              renderOption={(props, option) => {
                return (
                  <span
                    {...props}
                    style={{
                      backgroundColor: '#3d3d3d',
                      color: 'white',
                    }}
                  >
                    {option}
                  </span>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="freeSolo"
                  size="small"
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    sx: {
                      ...params.InputLabelProps.sx,
                      color: '#c7c7c7',
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      ...params.InputProps.sx,
                      color: 'white',
                    },
                  }}
                />
              )}
            />

            {/* <input
              type="text"
              placeholder="Task"
              value={props.task}
              onChange={props.onChange}
              style={{
                fontFamily: 'Segoe UI Regular',
              }}
            ></input> */}
          </div>
          <div className="footer">
            <IconButton
              sx={{
                width: '24px',
                height: '24px',
              }}
              onClick={props.onExtend}
            >
              <KeyboardArrowDownIcon
                sx={{
                  color: 'white',
                  width: '24px',
                  height: '24px',
                }}
              />
            </IconButton>
          </div>
        </div>
      ) : (
        <MergeIcon
          sx={{
            color: 'white',
            width: '72px',
            height: '72px',
          }}
        />
      )}
    </div>
  );
}
