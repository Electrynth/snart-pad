import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import {
  createMuiTheme,
  responsiveFontSizes,
  ThemeProvider
} from '@material-ui/core/styles';
import TextEditor from './components/TextEditor';


function App() {
  const theme = responsiveFontSizes(createMuiTheme({
    typography: { useNextVariants: true },
    palette: { type: 'dark', primary: { main: '#fafafa' } }
  }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TextEditor />
    </ThemeProvider>
  );
}

export default App;
