import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { dimension } from 'classes/Board';
import { paramType } from 'components/NPuzzle';
export type speed = 'Slow' | 'Medium' | 'Fast' | 'Skip';
export type puzzleType = 'NPuzzle';
export type algoType = 'staticWeighting-A*' | 'dynamicWeighting-A*' | 'alphA*' | 'greedy';

export interface MenuProps {
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
  shufflePuzzle: () => void;
  solved: boolean;
  setToUnsolved: () => void;
  onReturnToInitialState: () => void;
  onWatchAgain: () => void;
  mode: boolean;
  onModeChange: React.Dispatch<React.SetStateAction<boolean>>;
  speed: speed;
  onSpeedChange: React.Dispatch<React.SetStateAction<speed>>;
  dim: dimension;
  onDimensionChange: React.Dispatch<React.SetStateAction<dimension>>;
  puzzleType: puzzleType;
  onTypeChange: React.Dispatch<React.SetStateAction<puzzleType>>;
  algoType: algoType;
  onAlgoChange: React.Dispatch<React.SetStateAction<algoType>>;
  params: { [key in paramType]: number };
  onEpsilonChange: (value: number) => void;
  onPathLengthChange: (value: number) => void;
  onlambdaChange: (value: number) => void;
  onLambdaChange: (value: number) => void;
};

interface MenuItemProps {
  title: string;
  classes?: string;
  tooltip?: string;
  children: React.ReactNode;
};

export default function Menu(props: MenuProps) {
  const [classes, setClasses] = useState('two-ends');
  const [warning, setWarning] = useState('');

  const { setReady, shufflePuzzle, solved, setToUnsolved, onReturnToInitialState, onWatchAgain, mode, onModeChange, speed, onSpeedChange, dim, onDimensionChange, puzzleType, onTypeChange, algoType, onAlgoChange, params, onEpsilonChange, onPathLengthChange, onlambdaChange, onLambdaChange } = props;
  const { epsilon, pathLength, lambda, Lambda } = params;

  useEffect(() => {
    const handleWindowResize = () => {
      window.innerWidth >= 449 ? setClasses('table') : setClasses('two-ends');
    };
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const closeMenu = () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle') as HTMLButtonElement;
    document.querySelector('.mobile-menu') && menuToggle.click();
  };

  const handleCloseWarning = () => {
    setWarning('');
  };

  const handleTypeChange = (e: React.ChangeEvent<{ value: puzzleType }>) => {
    if (e.target.value === puzzleType) return;
    if (!mode) {
      setWarning('You are not allowed to change the puzzle while the algorithm is running!');
      return;
    }
    setReady(false);
    onTypeChange(e.target.value);
    setToUnsolved();
  };

  const handleSpeedChange = (newSpeed: speed) => () => {
    onSpeedChange(newSpeed);
  };

  const handleAlgoChange = (e: React.ChangeEvent<{ value: algoType }>) => {
    if (e.target.value === algoType) return;
    if (!mode) {
      setWarning('You are not allowed to change the algorithm while the algorithm is running!');
      return;
    }
    onAlgoChange(e.target.value);
    setToUnsolved();
  };

  const handleGenerateNewPuzzle = () => {
    let reset = false;
    const dimForm = document.getElementById('puzzle-dim-input-form') as HTMLFormElement;
    if (dimForm) {
      const row = document.getElementById('puzzle-dim-input-row') as HTMLInputElement;
      const col = document.getElementById('puzzle-dim-input-col') as HTMLInputElement;
      if (row.value.length === 0) {
        setWarning('Number of rows in the puzzle cannot be empty!');
        return;
      }
      if (col.value.length === 0) {
        setWarning('Number of columns in the puzzle cannot be empty!');
        return;
      }
      if (parseInt(row.value) < 2 || parseInt(row.value) > 10) {
        setWarning('Number of rows in the puzzle must be between 2 and 10, inclusive!');
        return;
      }
      if (parseInt(col.value) < 2 || parseInt(col.value) > 10) {
        setWarning('Number of columns in the puzzle must be between 2 and 10, inclusive!');
        return;
      }
      if (parseInt(row.value) !== dim[0] || parseInt(col.value) !== dim[1]) {
        onDimensionChange([parseInt(row.value), parseInt(col.value)]);
        reset = true;
      }
    }
    if (!reset) {
      shufflePuzzle();
      setReady(false);
    }
    setToUnsolved();
    setTimeout(closeMenu, 2e2);
  };

  const handleSolvePuzzle = () => {
    errorChecking();
    onModeChange(false);
    if (solved) onWatchAgain();
    setTimeout(closeMenu, 2e2);
  };

  const handleParamChangeEvent = (param: number, handler: (arg: number) => void) => (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseInt(e.target.value) === NaN) {
      setWarning('You must enter a numeric value to the paramters!');
      return;
    }
    if (!mode && parseInt(e.target.value) !== param) {
      setWarning('You are not allowed to change the parameters while the algorithm is running!');
      e.target.value = param.toString();
      return;
    }
    if (parseInt(e.target.value) !== param) {
      handler(parseInt(e.target.value));
      setToUnsolved();
    }
  };

  const errorChecking = () => {
    const ep = document.getElementById('epsilon-input') as HTMLInputElement;
    if (ep) {
      if (ep.value.length === 0) {
        setWarning('&epsilon; cannot be empty!');
        return;
      }
      if (parseInt(ep.value) < 1) {
        setWarning('&epsilon; must an integer greater than or equal to 1!');
        return;
      }
      if (Math.max(...dim) > 4 && parseInt(ep.value) < 3) {
        setWarning('A larger &epsilon; is recommended; otherwise, it may take the algorithm too long to finish!');
        return;
      }
    }
    const N = document.getElementById('path-length-input') as HTMLInputElement;
    if (N) {
      if (N.value.length === 0) {
        setWarning('Number of moves (N) cannot be empty!');
        return;
      }
      if (parseInt(N.value) === 0) {
        setWarning('Number of moves (N) must be an integer greater than 0!');
        return;
      }
    }
    const l = document.getElementById('lambda-input') as HTMLInputElement;
    if (l) {
      if (l.value.length === 0) {
        setWarning('&lambda; cannot be empty!');
        return;
      }
      if (parseInt(l.value) < -1) {
        setWarning('&lambda; must be greater than or equal to -1!');
        return;
      }
    }
    const L = document.getElementById('Lambda-input') as HTMLInputElement;
    if (L) {
      if (L.value.length === 0) {
        setWarning('&Lambda; cannot be empty!');
        return;
      }
      if (parseInt(L.value) < lambda) {
        setWarning('&Lambda; must be greater than or equal to &lambda;!');
        return;
      }
    }
  };

  return (<>
    <div className='menu-wrapper'>
      <div className='menu'>
        <MenuGroup title='Puzzle'>
          <MenuItemGroup title='Type' classes={classes}>
            <FormControl variant='outlined'>
              <InputLabel id='puzzle-type-input-label'>Type</InputLabel>
              <Select labelId='puzzle-type-input-label'
                id='puzzle-type-input'
                defaultValue={puzzleType}
                label='Type'
                onChange={handleTypeChange}>
                <MenuItem value='NPuzzle'>N-puzzle</MenuItem>
              </Select>
            </FormControl>
          </MenuItemGroup>
          <MenuItemGroup title='Dimension' classes={classes}>
            <form id='puzzle-dim-input-form' className='flex-row nowrap' noValidate autoComplete='off'>
              <div className='mui-textfield-sm'>
                <TextField id='puzzle-dim-input-row' label='row' defaultValue={dim[0]} variant='outlined' size='small'/>
              </div>
              <div className='mui-textfield-sm'>
                <TextField id='puzzle-dim-input-col' label='col' defaultValue={dim[1]} variant='outlined' size='small'/>
              </div>
            </form>
          </MenuItemGroup>
          <Button variant='contained' color='secondary' onClick={handleGenerateNewPuzzle} disabled={!mode}>
            Generate New Puzzle
          </Button>
        </MenuGroup>
        <MenuGroup title='Speed'>
          <MenuItemGroup title='Playback speed' classes='two-ends'>
            {classes === 'two-ends' && <FormControl variant='outlined'>
              <InputLabel id='playback-speed-input-label'>Speed</InputLabel>
              <Select labelId='playback-speed-input-label'
                id='playback-speed-input'
                value={speed}
                label='Speed'
                onChange={(e: React.ChangeEvent<{ value: speed }>) => handleSpeedChange(e.target.value)()}>
                <MenuItem value='Slow'>Slow</MenuItem>
                <MenuItem value='Medium'>Medium</MenuItem>
                <MenuItem value='Fast'>Fast</MenuItem>
                <MenuItem value='Skip'>Skip</MenuItem>
              </Select>
            </FormControl>}
            {classes === 'table' && <ButtonGroup color='secondary' aria-label='outlined secondary button group'>
              <Button onClick={handleSpeedChange('Slow')} size='small' disabled={speed === 'Slow'}>Slow</Button>
              <Button onClick={handleSpeedChange('Medium')} size='small' disabled={speed === 'Medium'}>Medium</Button>
              <Button onClick={handleSpeedChange('Fast')} size='small' disabled={speed === 'Fast'}>Fast</Button>
              <Button onClick={handleSpeedChange('Skip')} size='small' disabled={speed === 'Skip'}>Skip</Button>
            </ButtonGroup>}
          </MenuItemGroup>
        </MenuGroup>
        <MenuGroup title='Solver'>
          <p className='menu-content-text'>Feel it difficult to solve the puzzle? Pick an algorithm and ask for help!</p>
          <MenuItemGroup title='Algorithm' classes={classes}>
            <FormControl variant='outlined'>
              <InputLabel id='solver-algo-input-label'>Algorithm</InputLabel>
              <Select labelId='solver-algo-input-label'
                id='solver-algo-input'
                value={algoType}
                label='Algorithm'
                onChange={handleAlgoChange}>
                <MenuItem value='staticWeighting-A*'>Static Weighting A*</MenuItem>
                <MenuItem value='dynamicWeighting-A*'>Dynamic Weighting A*</MenuItem>
                <MenuItem value='alphA*'>AlphA*</MenuItem>
                {(dim[0] >3 || dim[1] > 3) && <MenuItem value='greedy'>Greedy</MenuItem>}
              </Select>
            </FormControl>
          </MenuItemGroup>
          {algoType.endsWith('A*') && <MenuItemGroup title='&epsilon; value' classes='table' tooltip='Weight of the heuristic function'>
            <div className='mui-textfield-sm'>
              <TextField id='epsilon-input' label='&epsilon;' defaultValue={epsilon} variant='outlined' size='small' onBlur={handleParamChangeEvent(epsilon, onEpsilonChange)}/>
            </div>
          </MenuItemGroup>}
          {algoType === 'dynamicWeighting-A*' && <MenuItemGroup title='# of moves' classes='table' tooltip='Number of anticipated moves to solve the puzzle'>
            <div className='mui-textfield-sm'>
              <TextField id='path-length-input' label='N' defaultValue={pathLength} variant='outlined' size='small' onBlur={handleParamChangeEvent(pathLength, onPathLengthChange)}/>
            </div>
          </MenuItemGroup>}
          {algoType === 'alphA*' && <>
            <MenuItemGroup title='&lambda; value' classes='table' tooltip='Parameter value of the &alpha;-perimeter'>
              <div className='mui-textfield-sm'>
                <TextField id='lambda-input' label='&lambda;' defaultValue={lambda} variant='outlined' size='small' onBlur={handleParamChangeEvent(lambda, onlambdaChange)}/>
              </div>
            </MenuItemGroup>
            <MenuItemGroup title='&Lambda; value' classes='table' tooltip='Parameter value of the &alpha;-perimeter'>
              <div className='mui-textfield-sm'>
                <TextField id='Lambda-input' label='&Lambda;' defaultValue={Lambda} variant='outlined' size='small' onBlur={handleParamChangeEvent(Lambda, onLambdaChange)}/>
              </div>
            </MenuItemGroup>
          </>}
          <Button onClick={handleSolvePuzzle} variant='contained' color='primary' style={{ marginBottom: '1rem' }} disabled={!mode}>
            {solved ? 'Watch Again' : 'Solve It!'}
          </Button>
          {solved && <Button onClick={onReturnToInitialState} variant='contained' disabled={!mode}>
            Try Yourself
          </Button>}
        </MenuGroup>
      </div>
    </div>
    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={warning.length > 0}
      onClose={handleCloseWarning}
      autoHideDuration={5e3}
      key='topcenter'>
      <MuiAlert onClose={handleCloseWarning} severity='warning' variant='filled' elevation={6}>
        {warning}
      </MuiAlert>
    </Snackbar>
  </>)
};

function MenuGroup({ title, children }: MenuItemProps) {
  return (
    <div className='menu-group flex-col'>
      <div className='menu-header'>
        <span className='header-title'>{title}</span>
      </div>
      <div className='menu-group-content flex-col'>
        {children}
      </div>
    </div>
  );
}

function MenuItemGroup({ title, classes, tooltip, children }: MenuItemProps) {
  return (
    <div className={'menu-item-group ' + classes}>
      {tooltip && tooltip.length > 0 ? <Tooltip title={tooltip} placement='top' arrow>
        <span className='menu-item'>{title}</span>
      </Tooltip> : <span className='menu-item'>{title}</span>}
      {children}
    </div>
  );
}
