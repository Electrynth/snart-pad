import React, { useState } from 'react';
import clsx from 'clsx';
import { Editor, EditorState } from 'draft-js';
import {
  withWidth,
  Paper,
  Typography,
  TextField,
  IconButton,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent
} from '@material-ui/core';
import {
  Add,
  Clear,
  ArrowForward,
  HelpOutline,
  ExpandMore
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import 'draft-js/dist/Draft.css';
import RegexExampleImage from '../assets/regex.png';
import NotepadExampleImage from '../assets/notepad.png';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  editorWindow: {
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 5,
    border: '1px solid rgba(255, 255, 255, 0.25)'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  closeModalButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  rowLayout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  columnLayout: {
    display: 'flex',
    flexDirection: 'column'
  }
}))

function deleteItem(items, i) {
  return items.slice(0, i).concat(items.slice(i + 1, items.length))
}

function countPointsInLine(line, definitionList) {
  let points = 0;
  const parenthesisMatches = line.match(/\(\d+\)/g)
  if (parenthesisMatches) {
    parenthesisMatches.forEach(match => points += Number.parseInt(match.slice(1, -1)));
  }
  definitionList.forEach(definition => {
    const definitionRe = new RegExp(definition[0], 'g');
    const definitionMatches = line.match(definitionRe);
    if (definitionMatches) points += definitionMatches.length * definition[1];
  });

  const multiplierMatches = line.match(/\d+x/);
  if (multiplierMatches && points > 0) {
    return points * Number.parseInt(multiplierMatches[0].charAt(0));
  } else return points;
}

function CollapseButton({ isExpanded, handleClick }) {
  const classes = useStyles();
  return (
    <IconButton
      className={clsx(classes.expand, {
        [classes.expandOpen]: isExpanded,
      })}
      aria-expanded={isExpanded}
      onClick={handleClick}
      style={{ marginLeft: 8 }}
    >
      <ExpandMore />
    </IconButton>
  );
};

function ExpansionPanel({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpandClick = () => setIsExpanded(!isExpanded);
  return (
    <Card square>
      <CardHeader
        title={title}
        action={
          <CollapseButton
            isExpanded={isExpanded}
            handleClick={handleExpandClick}
          />
        }
      />
      <Collapse unmountOnExit timeout="auto" in={isExpanded}>
        <CardContent style={{ display: 'flex', flexFlow: 'column nowrap' }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}

function ClosedDefinition({ definition, handleRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <TextField
        fullWidth
        disabled={true}
        margin="dense"
        variant="outlined"
        value={definition[0]}
      />
      <ArrowForward style={{ marginLeft: 12, marginRight: 12  }} />
      <TextField
        fullWidth
        disabled={true}
        margin="dense"
        variant="outlined"
        value={definition[1]}
      />
      <IconButton onClick={() => handleRemove(definition[0])} style={{ marginLeft: 8 }}>
        <Clear />
      </IconButton>
    </div>
  );
}

function OpenDefinition({ definitionMap, handleAdd }) {
  const [text, setText] = useState('');
  const [value, setValue] = useState(0);
  const changeText = (e) => setText(e.target.value);
  const changeValue = (e) => setValue(Number.parseInt(e.target.value) || 0);
  const isDisabled = text in definitionMap || text === '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <TextField
        fullWidth
        margin="dense"
        value={text}
        onChange={changeText}
      />
      <ArrowForward style={{ marginLeft: 12, marginRight: 12  }} />
      <TextField
        fullWidth
        margin="dense"
        value={value}
        onChange={changeValue}
      />
      <IconButton
        disabled={isDisabled}
        onClick={() => {
          setText('');
          setValue(0);
          handleAdd(text, value);
        }}
        style={{ marginLeft: 8 }}
      >
        <Add />
      </IconButton>
    </div>
  );
}

function TextEditor({ width }) {
  const classes = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [definitionList, setDefinitionList] = useState([]);
  const [definitionMap, setDefinitionMap] = useState({});
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const addDefinition = (text, value) => {
    setDefinitionMap({ ...definitionMap, [text]: definitionList.length });
    setDefinitionList([ ...definitionList, [text, value] ]);
  };
  const removeDefinition = (text) => {
    const newDefinitionList = deleteItem(definitionList, definitionMap[text])
    const newDefinitionMap = {};
    newDefinitionList.forEach((def, i) => newDefinitionMap[def[0]] = i);
    setDefinitionList(newDefinitionList);
    setDefinitionMap(newDefinitionMap);
  };
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const contentState = editorState.getCurrentContent();
  let grandTotal = 0;
  const lines = [...contentState.getBlockMap()];
  lines.forEach(([ hash, contentBlock ]) => {
    grandTotal += countPointsInLine(contentBlock.getText(), definitionList);
  });

  const isMobile = width === 'xs' || width === 'sm';

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h4">Snart Pad: The Smart Number Notepad</Typography>
      <div style={{ marginTop: 16 }} />
      <div className={clsx(classes.rowLayout, { [classes.columnLayout]: isMobile })}>
        <Paper elevation={2} style={{ padding: 16, width: '100%' }}>
          <Typography variant="h5">Regex Definitions</Typography>
          {definitionList.map(def =>
            <ClosedDefinition
              key={definitionMap[def[0]]}
              definition={def}
              handleRemove={removeDefinition}
            />
          )}
          <OpenDefinition definitionMap={definitionMap} handleAdd={addDefinition} />
        </Paper>
        <div style={isMobile ? { height: 12 } : { width: 24 }} />
        <Paper elevation={2} style={{ padding: 16, width: '100%' }}>
          <Typography variant="h5">Notepad</Typography>
          <div className={classes.editorWindow}>
            <Editor editorState={editorState} onChange={setEditorState} />
          </div>
          <Typography>
            Grand Total: {grandTotal}
          </Typography>
        </Paper>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <IconButton size="small" onClick={openModal} style={{ marginTop: 8 }}>
          <HelpOutline />
        </IconButton>
      </div>
      <Dialog
        open={isModalOpen}
        fullScreen={true}
        onClose={closeModal}
      >
        <DialogTitle>Information and More</DialogTitle>
        <IconButton className={classes.closeModalButton} onClick={closeModal}>
          <Clear />
        </IconButton>
        <DialogContent>
          <Typography style={{ marginBottom: 8 }}>
            Snart pad is a straightforward text editor that sums up numbers it
            finds. By default it will search for any numbers in parentheses and
            add them to the total. However, regex definitions with corresponding
            point costs can be also be added. Snart Pad searches for these
            regexes and if found the corresponding point value will be added.
            Additionally, if a number followed by the letter "x" is found, then
            the points on that line will be multiplied by that number.
          </Typography>
          <Typography style={{ marginBottom: 16 }}>
            This app was created primarily to provide a simple and game-agnostic
            option for building lists for tabletop games.
          </Typography>
          <ExpansionPanel title="Example">
            <Typography>Example with a few regex definitions:</Typography>
            <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center' }}>
              <img
                alt="regex example"
                src={RegexExampleImage}
                style={{ width: 400 }}
              />
            </div>
          <Typography>and the corresponding notepad:</Typography>
          <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center' }}>
            <img
              alt="notepad example"
              src={NotepadExampleImage}
              style={{ width: 400 }}
            />
        </div>
          </ExpansionPanel>
          <ExpansionPanel title="Additional Resources">
            <Typography>
              Regex tester&nbsp; - &nbsp;
              <a
                href="https://www.regexpal.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'lightblue', textDecoration: 'none' }}
              >
                RegEx Pal
              </a>
            </Typography>
            <Typography>
              Built with&nbsp; - &nbsp;
              <a
                href="https://draftjs.org/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'lightblue', textDecoration: 'none' }}
              >
                Draft.js
              </a>
            </Typography>
            <Typography>
              Questions and comments&nbsp; - &nbsp;
              <a
                href="mailto:nbrown4296@gmail.com"
                style={{ color: 'lightblue', textDecoration: 'none' }}
              >
                Email me
              </a>
            </Typography>
          </ExpansionPanel>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withWidth()(TextEditor);
