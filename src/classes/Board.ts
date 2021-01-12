import _ from 'lodash';

export type dimension = [number, number];
export type position = [number, number];
export type move = 'L' | 'R' | 'U' | 'D'; // all moves are moving the empty tile

export const reverseMap: { [key in move]: move } = {
  'L': 'R',
  'R': 'L',
  'U': 'D',
  'D': 'U'
};

export default class Board {
  private arr: number[][];
  private empty: position;

  constructor(...args: [row: number, col: number, board?: number[][]]) {
    this.arr = [];
    if (args.length < 3) {
      const [row, col] = args;
      let count = 1;
      for (let i = 0; i < row; i++) {
        this.arr.push([]);
        for (let j = 0; j < col; j++) {
          this.arr[i].push(count++);
        }
      }
      this.arr[row - 1][col - 1] = -1;
      this.empty = [row - 1, col - 1];
    } else {
      const [row, col, board] = args;
      for (let i = 0; i < row; i++) {
        this.arr.push([]);
        for (let j = 0; j < col; j++) {
          this.arr[i].push(board[i][j]);
          if (board[i][j] === -1) this.empty = [i, j];
        }
      }
    }
  }

  static convertIndex(i: number, dim: dimension): position {
    const x = Math.floor(i / dim[1]);
    const y = i % dim[1];
    return [x, y];
  }

  static isGoalState(board: number[]): boolean {
    if (board[board.length - 1] !== -1) return false;
    for (let i = 0; i < board.length - 2; i++) {
      if (board[i] > board[i + 1]) return false;
    }
    return true;
  }

  static manhattanDistance(board: number[][]): number {
    let h = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === -1) continue;
        const row = Math.floor((board[i][j] - 1) / board[i].length),
              col = (board[i][j] - 1) % board[i].length;
        h += Math.abs(row - i) + Math.abs(col - j);
      }
    }
    return h;
  }

  static manhattanDistance2(board: number[][]): number {
    const m = board.length, n = board[0].length;
    const nums = new Set<number>();
    for (let i = m - 3; i < m; i++) {
      for (let j = n - 3; j < n; j++) {
        nums.add(i * m + j + 1);
      }
    }
    let h = 0;
    for (let i = m - 3; i < m; i++) {
      for (let j = n - 3; j < n; j++) {
        if (board[i][j] === -1) continue;
        if (!nums.has(board[i][j])) h += (m + n) * 9;
        const row = Math.floor((board[i][j] - 1) / n),
              col = (board[i][j] - 1) % n;
        h += Math.abs(row - i) + Math.abs(col - j);
      }
    }
    return h;
  }

  static toString(board: number[][]): string {
    return board.map(row => row.join(',')).join('|');
  }

  static get2DArrayRep(s: string): number[][] {
    return s.split('|').map(row => row.split(',').map(d => parseInt(d)));
  }

  get getDimension(): dimension {
    return [this.arr.length, this.arr[0].length];
  }

  get get2DArrayRep(): number[][] {
    return this.arr;
  }

  get flatArray(): number[] {
    return [].concat(...this.arr);
  }

  get emptyTile(): position {
    return this.empty;
  }

  get startRow(): number {
    const m = this.arr.length, n = this.arr[0].length;
    let i = 0;
    while (i < m) {
      const solved = this.arr[i].map((num, j) => num === i * n + j + 1).reduce((a, b) => a && b);
      if (solved) i++;
      else break;
    }
    return i;
  }

  get startColumn(): number {
    const n = this.arr[0].length;
    let j = 0;
    while (j < n) {
      const solved = this.arr.map(row => row[j]).map((num, i) => num === i * n + j + 1).reduce((a, b) => a && b);
      if (solved) j++;
      else break;
    }
    return j;
  }

  shuffle(n: number): void {
    for (let i = 0; i < n; i++) {
      const moves: move[] = [];
      const [x, y] = this.empty;
      if (y > 0) { // left
        moves.push('L');
      }
      if (x > 0) { // up
        moves.push('U');
      }
      if (y + 1 < this.arr[0].length) { // right
        moves.push('R');
      }
      if (x + 1 < this.arr.length) { // down
        moves.push('D');
      }
      this.moveTile(_.sample(moves));
    }
  }

  getValidMove(pos: position): move | null {
    const [x, y] = pos;
    let move: move | null = null;
    if (x === this.empty[0] && y + 1 === this.empty[1]) move = 'L';
    else if (x === this.empty[0] && y - 1 === this.empty[1]) move = 'R';
    else if (x + 1 === this.empty[0] && y === this.empty[1]) move = 'U';
    else if (x - 1 === this.empty[0] && y === this.empty[1]) move = 'D';
    return move;
  }

  checkMove(move: move): boolean {
    const [x, y] = this.empty;
    switch (move) {
      case 'L': return y > 0;
      case 'R': return y + 1 < this.arr[0].length;
      case 'U': return x > 0;
      case 'D': return x + 1 < this.arr.length;
    }
  }

  moveTile(move: move): void {
    const [x, y] = this.empty;
    switch (move) {
      case 'L':
        this.arr[x][y] = this.arr[x][y - 1];
        this.arr[x][y - 1] = -1;
        this.empty = [x, y - 1];
        break;

      case 'R':
        this.arr[x][y] = this.arr[x][y + 1];
        this.arr[x][y + 1] = -1;
        this.empty = [x, y + 1];
        break;

      case 'U':
        this.arr[x][y] = this.arr[x - 1][y];
        this.arr[x - 1][y] = -1;
        this.empty = [x - 1, y];
        break;

      case 'D':
        this.arr[x][y] = this.arr[x + 1][y];
        this.arr[x + 1][y] = -1;
        this.empty = [x + 1, y];
        break;

      default:
        throw new Error('Invalid move!');
    }
  }

  reverse(moves: move[]): void {
    for (let i = moves.length - 1; i >= 0; i--) {
      this.moveTile(reverseMap[moves[i]]);
    }
  }

  find(target: number): position {
    for (let i = 0; i < this.arr.length; i++) {
      for (let j = 0; j < this.arr[i].length; j++) {
        if (this.arr[i][j] === target) return [i, j];
      }
    }
    return null;
  }
};
