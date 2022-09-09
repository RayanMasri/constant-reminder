import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const options = ['Past week', 'Past month', 'Past year', 'All time'];

export default function DateMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index) => {
    props.onChange(index);
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        width: props.width,
      }}
    >
      <Button
        fullWidth
        onClick={handleClickListItem}
        style={{
          color: 'white',
          fontFamily: 'Consolas',
          backgroundColor: '#3A3A3A',
          textAlign: 'left',
          justifyContent: 'space-between',
          display: 'flex',
          height: '42px',
          fontSize: '18px',
        }}
      >
        <div
          style={{
            marginLeft: '10px',
          }}
        >
          Tasks from:&nbsp;
          <span style={{ color: '#7D7D7D' }}>{options[selectedIndex]}</span>
        </div>
        <KeyboardArrowDownIcon
          sx={{
            width: 24,
            height: 24,
          }}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: props.width,
            backgroundColor: '#3A3A3A',
          },
        }}
        MenuListProps={{
          sx: {
            '&& .Mui-selected': {
              backgroundColor: '#555555',
              opacity: 1,
            },
            '&& .Mui-selected:hover': {
              backgroundColor: '#555555',
            },
          },
        }}
        className="menu"
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
