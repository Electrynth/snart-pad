import React, { useState } from 'react';
import { Editor, EditorState } from 'draft-js';
import {
  Paper,
  Typography,
  TextField,
  IconButton
} from '@material-ui/core';
import {
  Add,
  Clear,
  ArrowForward
} from '@material-ui/icons';
import 'draft-js/dist/Draft.css';

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
        onClick={() => handleAdd(text, value)}
        style={{ marginLeft: 8 }}
      >
        <Add />
      </IconButton>
    </div>
  );
}

function TextEditor() {
  const [definitionList, setDefinitionList] = useState([]);
  const [definitionMap, setDefinitionMap] = useState({});
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const addDefinition = (text, value) => {
    setDefinitionMap({ ...definitionMap, [text]: definitionList.length });
    setDefinitionList([ ...definitionList, [text, value] ]);
  };
  const removeDefinition = (text) => {
    setDefinitionList(deleteItem(definitionList, definitionMap[text]));
    const newDefinitionMap = { ...definitionMap };
    delete newDefinitionMap[text];
    setDefinitionMap(newDefinitionMap);
  };

  const contentState = editorState.getCurrentContent();
  let grandTotal = 0;
  const lines = [...contentState.getBlockMap()];
  lines.forEach(([ hash, contentBlock ]) => {
    grandTotal += countPointsInLine(contentBlock.getText(), definitionList);
  });

  return (
    <div style={{ padding: 16, display: 'flex', flexFlow: 'column nowrap' }}>
      <Typography variant="h4">Snart Pad: The Smart Number Notepad</Typography>
      <div style={{ marginTop: 16 }} />
      <Paper elevation={2} style={{ padding: 16 }}>
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
      <Paper elevation={2} style={{ padding: 16, marginTop: 8  }}>
        <Typography variant="h5">Notepad</Typography>
        <div
          style={{
            padding: 8,
            marginTop: 8,
            marginBottom: 8,
            borderRadius: 5,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Editor
            editorState={editorState}
            onChange={setEditorState}
          />
        </div>
        <Typography>
          Grand Total: {grandTotal}
        </Typography>
      </Paper>
    </div>
  );
};

export default TextEditor;
