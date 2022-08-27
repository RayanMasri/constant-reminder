import React from 'react';
import { render } from 'react-dom';
import { MainContextProvider } from './contexts/MainContext.jsx';

import Popup from './Popup';
import './index.css';

render(
  <MainContextProvider>
    <Popup />
  </MainContextProvider>,
  window.document.querySelector('#app-container')
);

if (module.hot) module.hot.accept();
