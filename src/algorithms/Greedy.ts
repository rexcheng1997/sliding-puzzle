import Board, { position, move, reverseMap } from 'classes/Board';
import { AStar } from 'algorithms/AStar';

interface GreedyType<T> {
  initialValue: T;
  g: (state: T) => number;
  h: (state: T) => number;
  getState: (state: T) => string;
  getMoves: (state: T) => string;
  createItem: (board: Board, moves: string) => T;
};

export class Greedy<T> {
  private board: Board;
  private moves: string;
  private baseCase: boolean;
  private aStarSolver: AStar<T>;
  private getState: (state: T) => string;
  private getMoves: (state: T) => string;
  private createItem: (board: Board, moves: string) => T;

  constructor({ initialValue, g, h, getState, getMoves, createItem }: GreedyType<T>) {
    this.moves = getMoves(initialValue);
    this.baseCase = false;
    this.aStarSolver = new AStar<T>({ initialValue, g, h, getState, getMoves });
    this.getState = getState;
    this.getMoves = getMoves;
    this.createItem = createItem;
  }

  getNext(): string {
    return this.baseCase ? this.aStarSolver.getNext() : (
      this.board ? (this.computeNextMoves(), this.moves) : this.moves
    );
  }

  add(state: T): void {
    if (this.baseCase) {
      this.aStarSolver.add(state);
    } else if (!this.board) {
      const tmp = Board.get2DArrayRep(this.getState(state));
      this.board = new Board(tmp.length, tmp[0].length, tmp);
      for (const move of this.getMoves(state)) this.board.moveTile(reverseMap[move as move]);
    }
  }

  private computeNextMoves(): void {
    const [m, n] = this.board.getDimension;
    const row = this.board.startRow, col = this.board.startColumn;
    if (m - row < 4 && n - col < 4) {
      this.baseCase = true;
      this.aStarSolver.getNext(); // discard initial value
      this.aStarSolver.add(this.createItem(this.board, this.moves));
      return;
    }
    let target: number, dest: position;
    if ((row <= col && m - row > 3) || n - col < 4) {
      for (let j = col; j < n; j++) {
        if (this.board.get2DArrayRep[row][j] !== row * n + j + 1) {
          dest = [row, j];
          target = row * n + j + 1;
          break;
        }
      }
      if (target === (row + 1) * n - 1) target++;
      else if (target === (row + 1) * n) dest[1]--;
    } else {
      for (let i = row; i < m; i++) {
        if (this.board.get2DArrayRep[i][col] !== i * n + col + 1) {
          dest = [i, col];
          target = i * n + col + 1;
          break;
        }
      }
      if (target === (m - 2) * n + col + 1) target += n;
      else if (target === (m - 1) * n + col + 1) dest[0]--;
    }
    const pos = this.board.find(target);
    this.moveAToB(pos, dest, target);
  }

  private moveAToB(A: position, B: position, val: number): void {
    const [m, n] = this.board.getDimension;
    if (val % n === 0) { // last two tiles in the row
      this._moveAToB(A, B);
      const C = this.board.find(val - 1);
      this._moveAToB(C, [B[0] + 1, B[1]]);
      this._moveEmptyTo([B[0], B[1] + 1], C);
      this.performMoves('LD');
      this.checkDeadLock(val);
    } else if (Math.floor(val / n) === m - 1) { // last two tiles in the column
      this._moveAToB(A, B);
      const C = this.board.find(val - n);
      this._moveAToB(C, [B[0], B[1] + 1]);
      this._moveEmptyTo([B[0] + 1, B[1]], C);
      this.performMoves('UR');
      this.checkDeadLock(val);
    } else { // move A to B directly
      this._moveAToB(A, B);
    }
  }

  private _moveAToB(A: position, B: position): void {
    const n = this.board.getDimension[1];
    // move horizontally
    while (A[1] !== B[1]) {
      const [dx, move] = A[1] < B[1] ? [1, 'L'] : [-1, 'R'];
      const col = this.board.startColumn;
      let i = 0;
      while (i <= A[0]) {
        if (this.board.get2DArrayRep[i][col] !== i * n + col + 1) break;
        i++;
      }
      if (A[1] + dx <= col && A[0] < i) break;
      this._moveEmptyTo([A[0], A[1] + dx], A);
      this.performMoves(move);
      A[1] += dx;
    }
    // move vertically
    while (A[0] !== B[0]) {
      const [dy, move] = A[0] < B[0] ? [1, 'U'] : [-1, 'D'];
      const row = this.board.startRow;
      let j = 0
      while (j <= A[1]) {
        if (this.board.get2DArrayRep[row][j] !== row * n + j + 1) break;
        j++;
      }
      if (A[0] + dy <= row && A[1] < j) break;
      this._moveEmptyTo([A[0] + dy, A[1]], A);
      this.performMoves(move);
      A[0] += dy;
    }
    if (A[0] !== B[0] || A[1] !== B[1]) {
      this.checkDeadLock(A, B);
      this._moveAToB(A, B);
    }
  }

  private _moveEmptyTo(p: position, obstacle: position): void {
    let [x, y] = this.board.emptyTile;
    if (x === p[0] && y === p[1]) return;
    let deadEnd = true;
    const [m, n] = this.board.getDimension;
    if (x !== p[0]) { // move vertically
      const [dx, move]: [number, move] = x < p[0] ? [1, 'D'] : [-1, 'U'];
      if (obstacle[0] === x + dx && obstacle[1] === y) { // obstacle in the way
        if (x + 2 * dx >= 0 && x + 2 * dx < m) {
          deadEnd = false;
          if (this.board.checkMove('R')) {
            this.performMoves('R' + move + move);
            if (this.board.emptyTile[0] === p[0] && this.board.emptyTile[1] === p[1]) return;
            this.performMoves('L');
          }
          else {
            this.performMoves('L' + move + move);
            if (this.board.emptyTile[0] === p[0] && this.board.emptyTile[1] === p[1]) return;
            this.performMoves('R');
          }
        }
      } else if (move === 'U') { // move up
        const col = this.board.startColumn;
        let sorted = this.board.get2DArrayRep[x - 1][col] === (x - 1) * n + col + 1;
        for (let j = col + 1; j <= y; j++) {
          if (this.board.get2DArrayRep[x - 1][j] !== (x - 1) * n + j + 1) {
            sorted = false;
            break;
          }
        }
        if (x - 1 > this.board.startRow || !sorted || this.board.get2DArrayRep[x - 1][y] === x * n - 1) {
          this.performMoves(move);
          deadEnd = false;
        }
      } else { // move down
        this.performMoves(move);
        deadEnd = false;
      }
    }
    [x, y] = this.board.emptyTile;
    if (y !== p[1]) { // move horizontally
      const [dy, move]: [number, move] = y < p[1] ? [1, 'R'] : [-1, 'L'];
      if (obstacle[0] === x && obstacle[1] === y + dy) { // obstacle in the way
        if (y + 2 * dy >= 0 && y + 2 * dy < n) {
          deadEnd = false;
          if (this.board.checkMove('D')) {
            this.performMoves('D' + move + move);
            if (this.board.emptyTile[0] === p[0] && this.board.emptyTile[1] === p[1]) return;
            this.performMoves('U');
          }
          else {
            this.performMoves('U' + move + move);
            if (this.board.emptyTile[0] === p[0] && this.board.emptyTile[1] === p[1]) return;
            this.performMoves('D');
          }
        }
      } else if (move === 'L') { // move left
        const row = this.board.startRow;
        let sorted = this.board.get2DArrayRep[row][y - 1] === row * n + y;
        for (let i = row + 1; i <= x; i++) {
          if (this.board.get2DArrayRep[i][y - 1] !== i * n + y - 1 + 1) {
            sorted = false;
            break;
          }
        }
        if (y - 1 > this.board.startColumn || !sorted || this.board.get2DArrayRep[x][y - 1] === (m - 2) * n + y) {
          this.performMoves(move);
          deadEnd = false;
        }
      } else { // move right
        this.performMoves(move);
        deadEnd = false;
      }
    }
    if (deadEnd) throw new Error('Dead End!');
    else this._moveEmptyTo(p, obstacle);
  }

  private performMoves(moves: string): void {
    for (const move of moves) this.board.moveTile(move as move);
    this.moves += moves;
  }

  private checkDeadLock(...args: [number | position, position?]): void {
    if (args.length === 1) {
      const val = args[0] as number;
      const p = this.board.find(val);
      if (this.board.emptyTile[0] === p[0] && this.board.emptyTile[1] === p[1] - 1 && this.board.get2DArrayRep[p[0] - 1][p[1] - 1] === val - 1) { // dead lock in row
        this.performMoves('DRUULDRDLUURD');
      } else if (this.board.emptyTile[0] === p[0] - 1 && this.board.emptyTile[1] === p[1] && this.board.get2DArrayRep[p[0] - 1][p[1] - 1] === val - this.board.getDimension[1]) { // dead lock in column
        this.performMoves('DRULDLURRDLULDR');
      }
    } else {
      const [A, B] = args as [position, position];
      if (this.board.get2DArrayRep[A[0]][A[1]] === this.board.get2DArrayRep[B[0]][B[1]] + 1) { // dead lock in row
        this._moveEmptyTo([A[0], A[1] - 1], A);
        this.performMoves('DRRUL');;
      } else if (this.board.get2DArrayRep[A[0]][A[1]] === this.board.get2DArrayRep[B[0]][B[1]] + this.board.getDimension[1]) { // dead lock in column
        this._moveEmptyTo([A[0] - 1, A[1]], A);
        this.performMoves('RDDLU');
      } else if (this.board.emptyTile[0] === A[0] && this.board.emptyTile[1] === A[1]) {
        const n = this.board.getDimension[1];
        if (A[0] === B[0] + 1 && A[1] === B[1] && this.board.get2DArrayRep[B[0]][B[1]] === B[0] * n + B[1] + 1) this.performMoves('DRUULDRDLUURD');
        else if (A[0] === B[0] && A[1] === B[1] + 1 && this.board.get2DArrayRep[B[0]][B[1]] === B[0] * n + B[1] + 1) this.performMoves('DRULDLURRDLULDR');
      } else {
        console.log(this.board.get2DArrayRep.map(row => row.slice()));
        console.log(A, B);
      }
    }
  }
};
