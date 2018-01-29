import { ThemeProvider } from 'styled-components';
import ReactDOM from 'react-dom';
import theme from './ui/theme';
import React from 'react';
import App from './ui/App';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
