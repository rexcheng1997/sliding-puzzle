import React, { Component, createRef, useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

import anime from 'animejs';
import { speed, algoType } from 'components/Menu';
import Board, { dimension, position, move, reverseMap } from 'classes/Board';
import { StaticWeightingAStar, DynamicWeightingAStar } from 'algorithms/AStar';

interface puzzleProps {
  dim: dimension;
  speed: speed;
  mode: boolean;
  reset: boolean;
  revert: boolean;
  replay: boolean;
  algorithm: algoType;
  epsilon: number;
  pathLength: number
  solved: boolean;
  onReady: () => void;
  onSolved: () => void;
};

interface puzzleState {
  boardWidth: number;
  boardHeight: number;
  tileSize: number;
  tiles: number[];
  solvingState: string;
  openDialog: boolean;
}

interface tileProps {
  frozen: boolean;
  gameboard: Board;
  setTiles: React.Dispatch<React.SetStateAction<number[]>>;
  onMove: (m: move) => void;
  dim: dimension;
  speed: speed;
  val: number;
  size: number;
  padding: number;
  margin: number;
  pos: position;
};

const speedMap: { [key in speed]: number } = {
  'Slow': 0.5,
  'Medium': 0.3,
  'Fast': 0.1,
  'Skip': 0
};

type solverStateType = [number, string, string];
const algoMap: { [key in algoType]: any } = {
  'staticWeighting-A*': (epsilon: number) => new StaticWeightingAStar<[number, string, string]>({
    initialValue: [0, '', ''], // cost, moves, state
    setCost: (arg: solverStateType, val: number) => (arg[0] = val + arg[1].length),
    getPriority: (arg: solverStateType) => -arg[0],
    getMoves: (arg: solverStateType) => arg[1],
    getState: (arg: solverStateType) => arg[2],
    epsilon: epsilon
  }),
  'dynamicWeighting-A*': (epsilon: number, N: number) => new DynamicWeightingAStar<[number, string, string]>({
    initialValue: [0, '', ''], // cost, moves, state
    setCost: (arg: solverStateType, val: number) => (arg[0] = val + arg[1].length),
    getPriority: (arg: solverStateType) => -arg[0],
    getMoves: (arg: solverStateType) => arg[1],
    getState: (arg: solverStateType) => arg[2],
    getDepth: (arg: solverStateType) => arg[1].length,
    epsilon: epsilon,
    N: N
  })
}

export default class NPuzzle extends Component<puzzleProps, puzzleState> {
  private board = createRef<HTMLDivElement>();
  private padding = 0;
  private gameboard = new Board(...this.props.dim);
  private moves: move[] = [];
  private solution: move[] = [];
  private solver: StaticWeightingAStar<solverStateType>;
  state: puzzleState = {
    boardWidth: 0,
    boardHeight: 0,
    tileSize: 100,
    tiles: [],
    solvingState: '',
    openDialog: false
  };

  componentDidMount() {
    this.padding = parseInt(window.getComputedStyle(this.board.current).padding);
    this.setState({
      boardWidth: this.state.tileSize * this.props.dim[1] + this.state.tileSize / 5 * (this.props.dim[1] - 1) + 2 * this.padding,
      boardHeight: this.state.tileSize * this.props.dim[0] + this.state.tileSize / 5 * (this.props.dim[0] - 1) + 2 * this.padding
    })
    this.handleWindowResize();
    this.gameboard.shuffle(this.props.dim[0] * this.props.dim[1] * 5);
    this.setTiles(this.gameboard.flatArray);
    this.props.onReady();
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('keydown', this.handleKeyPress);
  }

  componentDidUpdate(prevProps: puzzleProps, prevState: puzzleState) {
    if (prevProps.reset !== this.props.reset) {
      this.gameboard.shuffle(this.props.dim[0] * this.props.dim[1] * 5);
      this.moves = [];
      this.setTiles(this.gameboard.flatArray);
      this.props.onReady();
    }
    if (prevProps.revert !== this.props.revert) {
      if (this.moves.length > 0) {
        this.setState({ solvingState: 'Returned to the initial state.' });
      }
      this.gameboard.reverse(this.moves);
      this.moves = [];
      this.setTiles(this.gameboard.flatArray);
    }
    if (prevProps.solved !== this.props.solved && !this.props.solved) {
      if (this.moves.length > 0) {
        this.setState({ solvingState: 'Returned to the initial state.' });
      }
      this.gameboard.reverse(this.moves);
      this.moves = [];
      this.solution = [];
      this.setTiles(this.gameboard.flatArray);
    }
    if (prevProps.dim !== this.props.dim) {
      this.handleWindowResize();
      this.gameboard = new Board(...this.props.dim);
      this.gameboard.shuffle(this.props.dim[0] * this.props.dim[1] * 5);
      this.moves = [];
      this.solution = [];
      this.setTiles(this.gameboard.flatArray);
      this.props.onReady();
    }
    const askToSolvePuzzle = prevProps.mode !== this.props.mode && !this.props.solved;
    if (askToSolvePuzzle || prevProps.replay !== this.props.replay) {
      if (!this.props.mode && this.moves.length > 0) {
        this.setState({ solvingState: 'Returning to the initial state...' });
      }
      this.gameboard.reverse(this.moves);
      this.moves = [];
      this.setTiles(this.gameboard.flatArray);
      this.solver = algoMap[this.props.algorithm](this.props.epsilon, this.props.pathLength);
      setTimeout(this.solvePuzzle(), 2e3 * speedMap[this.props.speed]);
    }
    if (this.props.mode && prevState.tiles !== this.state.tiles && Board.isGoalState(this.state.tiles)) {
      this.setState({ openDialog: true });
    }
  }

  render() {
    const { mode, dim } = this.props;
    const { boardWidth, boardHeight, tileSize, tiles } = this.state;
    return (<>
      <div className='board' ref={this.board} style={{ width: boardWidth, height: boardHeight }}>
        {tiles.map((num, i) => <Tile key={num}
          frozen={!mode} gameboard={this.gameboard}
          setTiles={this.setTiles} onMove={(m: move) => this.moves.push(m)}
          dim={dim} speed={this.props.speed} val={num} size={tileSize}
          padding={this.padding} margin={tileSize / 5}
          pos={Board.convertIndex(i, dim)}
        />)}
      </div>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={this.state.solvingState.length > 0}
        onClose={this.closeSnackbar}
        message={this.state.solvingState}
        action={<IconButton size='small' aria-label='close' color='inherit' onClick={this.closeSnackbar}>
          <CloseIcon fontSize='small'/>
        </IconButton>}/>
      <Dialog open={this.state.openDialog} onClose={this.closeDialog}
        aria-labelledby='npuzzle-solved-dialog-title'
        aria-describedby='npuzzle-solved-dialog-desc'>
        <DialogTitle id='npuzzle-solved-dialog-title'>Great Job!</DialogTitle>
        <DialogContent>
          <DialogContentText id='npuzzle-solved-dialog-desc'>
            {`Congratulations! You have solved the ${dim[0]}x${dim[1]} puzzle!`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeDialog} color='secondary'>Close</Button>
        </DialogActions>
      </Dialog>
    </>);
  }

  closeSnackbar = () => {
    this.setState({ solvingState: '' });
  };

  closeDialog = () => {
    this.setState({ openDialog: false });
  };

  setTiles = (t: number[]) => {
    this.setState({ tiles: t });
  };

  setTileSize = (size: number) => {
    this.setState({ tileSize: size });
  };

  solvePuzzle = (i = 0) => () => {
    if (this.solution.length > 0) {
      this.setState({ solvingState: 'Solving...' });
      this.moves.push(this.solution[i]);
      this.gameboard.moveTile(this.solution[i]);
      this.setTiles(this.gameboard.flatArray);
      if (i + 1 < this.solution.length) {
        setTimeout(this.solvePuzzle(i + 1), 1e2 + 1e3 * speedMap[this.props.speed]);
      } else {
        this.setState({ solvingState: `Solved in ${this.solution.length} moves!` });
        this.props.onSolved();
      }
    } else {
      const nextMoves = this.solver.getNext().split('') as move[];
      let j = 0, k = 0;
      while (j < this.moves.length && k < nextMoves.length) {
        if (this.moves[j] !== nextMoves[k]) break;
        j++;
        k++;
      }
      new Promise(resolve => {
        const tmp = this.moves.slice(j, this.moves.length).map(m => reverseMap[m]);
        if (tmp.length > 0) this.setState({ solvingState: 'Backtracking...' });
        this.moveTiles(tmp, resolve);
      }).then(() => {
        this.setState({ solvingState: 'Solving...' });
        return new Promise(resolve => {
          this.moveTiles(nextMoves.slice(k, nextMoves.length).reverse(), resolve);
        });
      }).then(() => {
        this.moves = [...nextMoves];
        if (Board.isGoalState(this.gameboard.flatArray)) {
          console.log(`Solution takes ${nextMoves.length} moves.`);
          this.setState({ solvingState: `Solved in ${nextMoves.length} moves!` });
          this.setTiles(this.gameboard.flatArray);
          this.solution = [...nextMoves];
          this.props.onSolved();
        } else {
          const ms: move[] = ['L', 'R', 'U', 'D'];
          for (const m of ms) {
            if (this.gameboard.checkMove(m)) {
              nextMoves.push(m);
              this.gameboard.moveTile(m);
              this.solver.add(
                [0, nextMoves.join(''), Board.hash(this.gameboard.flatArray)],
                this.gameboard.heuristic()
              );
              this.gameboard.moveTile(reverseMap[m]);
              nextMoves.pop();
            }
          }
          setTimeout(this.solvePuzzle(), 1e3 * speedMap[this.props.speed]);
        }
      });
    }
  };

  moveTiles = (moves: move[], resolve: (value: unknown) => void) => {
    if (moves.length === 0) return resolve(null);
    const move = moves.pop();
    this.gameboard.moveTile(move);
    this.setTiles(this.gameboard.flatArray);
    setTimeout(() => this.moveTiles(moves, resolve), 1e3 * speedMap[this.props.speed]);
  };

  handleWindowResize = () => {
    const { dim: [row, col] } = this.props;
    let { tileSize } = this.state;
    const maxSize = Math.floor(this.board.current.parentElement.clientWidth / 100) * 100; // compute maximum size in 100px
    const currentSize = tileSize * col + tileSize / 5 * (col - 1) + 2 * this.padding;
    if (currentSize > maxSize || currentSize < 2 / 3 * maxSize) {
      // tileSize * col + tileSize / 5 * (col - 1) = maxSize - 2 * padding
      tileSize = Math.min((maxSize - 2 * this.padding) / (col + (col - 1) / 5), 100);
      this.setTileSize(tileSize);
    }
    this.setState({
      boardWidth: tileSize * col + tileSize / 5 * (col - 1) + 2 * this.padding,
      boardHeight: tileSize * row + tileSize / 5 * (row - 1) + 2 * this.padding
    });
  };

  handleKeyPress = (e: KeyboardEvent) => {
    if (!this.props.mode) return;
    const bundle = (m: move) => {
      if (!this.gameboard.checkMove(m)) return;
      this.moves.push(m);
      this.gameboard.moveTile(m);
      this.setTiles(this.gameboard.flatArray);
    };
    switch (e.key) {
      case 'ArrowUp':
        bundle('D');
        break;

      case 'ArrowDown':
        bundle('U');
        break;

      case 'ArrowLeft':
        bundle('R');
        break;

      case 'ArrowRight':
        bundle('L');
    }
  };
};

function Tile(props: tileProps) {
  const { frozen, gameboard, setTiles, onMove, dim, speed, val, size, padding, margin, pos } = props;
  const [x, y] = pos;
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    anime({
      targets: self.current,
      top: padding + x * (size + margin),
      left: padding + y * (size + margin),
      easing: 'easeInOutQuad',
      duration: 1e3 * speedMap[speed]
    });
  }, [props.pos, props.size, props.padding, props.margin]);

  const handleClick = () => {
    if (frozen) return;
    const move = gameboard.getValidMove(pos);
    if (move) {
      gameboard.moveTile(move);
      setTiles(gameboard.flatArray);
      onMove(move);
    }
  };

  return (
    <div className={val === -1 ? 'tile empty' : 'tile'} ref={self} style={{
      width: size, height: size,
      marginRight: y + 1 === dim[1] ? 0 : margin,
      marginBottom: x + 1 === dim[0] ? 0 : margin,
      borderRadius: size / 6
    }} onClick={handleClick}>
      <span className='tile-number' style={{
        fontSize: size * 0.6, lineHeight: `${size}px`, marginTop: -size / 20
      }}>{val}</span>
    </div>
  )
}
