import PriorityQueue from 'classes/PriorityQueue';

interface AStarType<T> {
  initialValue: T;
  setCost: (arg: T, val: number) => void;
  getPriority: (arg: T) => number;
  getMoves: (arg: T) => string;
  getState: (arg: T) => string;
};
interface StaticWeightingAStarType<T> extends AStarType<T> {
  epsilon: number;
};
interface DynamicWeightingAStarType<T> extends StaticWeightingAStarType<T> {
  N: number;
  getDepth: (arg: T) => number;
}
interface AlphaAStarType<T> extends StaticWeightingAStarType<T> {
  lambda: number;
  Lambda: number;
  g: (arg: any) => number;
  pi: (arg: any) => any;
}

export class AStar<T> {
  protected pq: PriorityQueue<T>;
  protected visited: Set<string>;
  protected setCost: (arg: T, val: number) => void; // g(n)
  protected getMoves: (arg: T) => string; // get the moves representation
  protected getState: (arg: T) => string; // get the state representation

  constructor({ initialValue, setCost, getPriority, getMoves, getState }: AStarType<T>) {
    this.pq = new PriorityQueue<T>(getPriority);
    this.pq.push(initialValue);
    this.visited = new Set<string>();
    this.setCost = setCost;
    this.getMoves = getMoves;
    this.getState = getState;
  }

  getNext(): string {
    let next = this.pq.pop();
    while (this.visited.has(this.getState(next))) {
      next = this.pq.pop();
    }
    this.visited.add(this.getState(next));
    return this.getMoves(next);
  }

  add(arg: T, h: number) {
    this.setCost(arg, h);
    this.pq.push(arg);
  }
};

export class StaticWeightingAStar<T> extends AStar<T> {
  protected epsilon: number;

  constructor({ initialValue, setCost, getPriority, getMoves, getState, epsilon }: StaticWeightingAStarType<T>) {
    super({ initialValue, setCost, getPriority, getMoves, getState });
    this.epsilon = epsilon;
  }

  add(arg: T, h: number) {
    this.setCost(arg, this.epsilon * h);
    this.pq.push(arg);
  }
};

export class DynamicWeightingAStar<T> extends StaticWeightingAStar<T> {
  private N: number;
  private getDepth: (arg: T) => number;

  constructor({ initialValue, setCost, getPriority, getMoves, getState, getDepth, epsilon, N }: DynamicWeightingAStarType<T>) {
    super({ initialValue, setCost, getPriority, getMoves, getState, epsilon });
    this.N = N;
    this.getDepth = getDepth;
  }

  add(arg: T, h: number) {
    const w = this.getDepth(arg) <= this.N ? (1 - this.getDepth(arg) / this.N) : 0;
    this.setCost(arg, (1 + this.epsilon * w) * h);
    this.pq.push(arg);
  }
};

export class AlphaAStar<T> extends StaticWeightingAStar<T> {
  private lambda: number;
  private Lambda: number;
  private calcMoveCost: (arg: any) => number;
  private getParent: (arg: any) => any;

  constructor({ initialValue, setCost, getPriority, getMoves, getState, g, pi, epsilon, lambda, Lambda }: AlphaAStarType<T>) {
    super({ initialValue, setCost, getPriority, getMoves, getState, epsilon });
    this.calcMoveCost = g;
    this.getParent = pi;
    this.lambda = lambda;
    this.Lambda = Lambda;
  }

  add(arg: T, h: number) {
    const f = this.calcMoveCost(this.getMoves(arg)) + this.epsilon * h;
    const visitedMoves = Array.from(this.visited);
    const costOfParent = this.calcMoveCost(this.getParent(this.getMoves(arg)));
    const costOfMostRecent = this.calcMoveCost(visitedMoves[visitedMoves.length - 1]);
    const wa = costOfParent >= costOfMostRecent ? this.lambda : this.Lambda;
    this.setCost(arg, (1 + wa) * f);
    this.pq.push(arg);
  }
}
