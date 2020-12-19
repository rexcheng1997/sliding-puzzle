import React, { useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Nav from 'components/Nav';
import Menu, { speed, puzzleType, algoType } from 'components/Menu';
import NPuzzle, { paramType } from 'components/NPuzzle';

export default function App() {
  const [ready, setReady] = useState(false);
  const [reboot, setReboot] = useState(false); // used to reset the puzzle
  const [dim, setDim] = useState<[number, number]>([3, 3]); // dimension of n-puzzle
  const [puzzleType, setPuzzleType] = useState<puzzleType>('NPuzzle');
  const [speed, setSpeed] = useState<speed>('Medium');
  const [userMode, setUserMode] = useState(true); // userMode: true => user is solving the puzzle
  const [isSolved, setIsSolved] = useState(false);
  const [revert, setRevert] = useState(false); // used to change the puzzle to its initial state
  const [watchAgain, setWatchAgain] = useState(false); // used to replay the solution
  const [algoType, setAlgoType] = useState<algoType>('staticWeighting-A*');
  const [params, _setParams] = useState<{ [key in paramType]: number }>({
    epsilon: 5, // static weight A*
    pathLength: 100, // dynamic weighting A*
    lambda: 0, // alphaA*
    Lambda: 5 // alphaA*
  });

  const handlePuzzleSolved = () => {
    setIsSolved(true);
    setUserMode(true);
  };

  const setParams = (key: paramType) => (value: number) => {
    const newParams = {...params};
    newParams[key] = value;
    _setParams(newParams);
  };

  return (<>
    <Nav setReady={setReady} shufflePuzzle={() => setReboot(!reboot)}
      solved={isSolved} setToUnsolved={() => setIsSolved(false)}
      onReturnToInitialState={() => setRevert(!revert)}
      onWatchAgain={() => setWatchAgain(!watchAgain)}
      mode={userMode} onModeChange={setUserMode}
      speed={speed} onSpeedChange={setSpeed}
      dim={dim} onDimensionChange={setDim}
      puzzleType={puzzleType} onTypeChange={setPuzzleType}
      algoType={algoType} onAlgoChange={setAlgoType}
      params={params} onEpsilonChange={setParams('epsilon')}
      onPathLengthChange={setParams('pathLength')}
      onlambdaChange={setParams('lambda')}
      onLambdaChange={setParams('Lambda')}/>
    <main className='container'>
      <div className={ready ? 'board-wrapper ready' : 'board-wrapper'}>
        <NPuzzle dim={dim} speed={speed} mode={userMode} reset={reboot} revert={revert} replay={watchAgain} algorithm={algoType} params={params} solved={isSolved} onReady={() => setReady(true)} onSolved={handlePuzzleSolved}/>
        {!ready && <div className='loader flex-col align-center'>
          <CircularProgress color='secondary'/>
          <small>Generating new puzzle...</small>
        </div>}
      </div>
      <div className='side-menu'>
        <Menu setReady={setReady} shufflePuzzle={() => setReboot(!reboot)}
          solved={isSolved} setToUnsolved={() => setIsSolved(false)}
          onReturnToInitialState={() => setRevert(!revert)}
          onWatchAgain={() => setWatchAgain(!watchAgain)}
          mode={userMode} onModeChange={setUserMode}
          speed={speed} onSpeedChange={setSpeed}
          dim={dim} onDimensionChange={setDim}
          puzzleType={puzzleType} onTypeChange={setPuzzleType}
          algoType={algoType} onAlgoChange={setAlgoType}
          params={params} onEpsilonChange={setParams('epsilon')}
          onPathLengthChange={setParams('pathLength')}
          onlambdaChange={setParams('lambda')}
          onLambdaChange={setParams('Lambda')}/>
      </div>
      <div className='side-background'/>
    </main>
  </>);
};
