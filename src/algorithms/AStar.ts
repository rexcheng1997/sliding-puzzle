import PriorityQueue from 'classes/PriorityQueue';

interface AStarType<T> {
  initialValue: T;
  g: (state: T) => number;
  h: (state: T) => number;
  getState: (state: T) => string;
  getMoves: (state: T) => string;
};
interface StaticWeightingAStarType<T> extends AStarType<T> {
  epsilon: number;
};
interface DynamicWeightingAStarType<T> extends StaticWeightingAStarType<T> {
  N: number;
  getDepth: (state: T) => number;
};
interface AlphAStarType<T> extends StaticWeightingAStarType<T> {
  lambda: number;
  Lambda: number;
  pi: (state: T) => T;
};

export class AStar<T> {
  protected pq: PriorityQueue<[number, T]>;
  protected visited: Map<string, T>;
  protected g: (state: T) => number;
  protected h: (state: T) => number;
  protected getState: (state: T) => string;
  protected getMoves: (state: T) => string;

  constructor({ initialValue, g, h, getState, getMoves }: AStarType<T>) {
    this.pq = new PriorityQueue<[number, T]>((item: [number, T]) => item[0]);
    this.pq.push([0, initialValue]);
    this.visited = new Map<string, T>();
    this.g = g;
    this.h = h;
    this.getState = getState;
    this.getMoves = getMoves;
  }

  getNext(): string {
    let [, next] = this.pq.pop();
    while (this.visited.has(this.getState(next))) {
      [, next] = this.pq.pop();
    }
    this.visited.set(this.getState(next), next);
    return this.getMoves(next);
  }

  add(state: T): void {
    // f(n) = g(n) + h(n)
    this.pq.push([this.g(state) + this.h(state), state]);
  }
};

export class StaticWeightingAStar<T> extends AStar<T> {
  protected epsilon: number;

  constructor({ initialValue, g, h, getState, getMoves, epsilon }: StaticWeightingAStarType<T>) {
    super({ initialValue, g, h, getState, getMoves });
    this.epsilon = epsilon;
  }

  add(state: T): void {
    // f(n) = g(n) + epsilon * h(n)
    this.pq.push([this.g(state) + this.epsilon * this.h(state), state]);
  }
};

export class DynamicWeightingAStar<T> extends StaticWeightingAStar<T> {
  private N: number;
  private getDepth: (state: T) => number;

  constructor({ initialValue, g, h, getState, getMoves, getDepth, epsilon, N }: DynamicWeightingAStarType<T>) {
    super({ initialValue, g, h, getState, getMoves, epsilon });
    this.N = N;
    this.getDepth = getDepth;
  }

  add(state: T): void {
    // f(n) = g(n) + (1 + epsilon * w(n)) * h
    // w(n) = 1 - d(n) / N if d(n) <= N else 0
    const w = this.getDepth(state) <= this.N ? (1 - this.getDepth(state) / this.N) : 0;
    this.pq.push([this.g(state) + (1 + this.epsilon * w) * this.h(state), state]);
  }
};

export class AlphAStar<T> extends StaticWeightingAStar<T> {
  private lambda: number;
  private Lambda: number;
  private pi: (state: T) => T;

  constructor({ initialValue, g, h, getState, getMoves, pi, epsilon, lambda, Lambda }: AlphAStarType<T>) {
    super({ initialValue, g, h, getState, getMoves, epsilon });
    this.pi = pi;
    this.lambda = lambda;
    this.Lambda = Lambda;
  }

  add(state: T): void {
    // fa(n) = (1 + wa(n)) * f(n)
    // wa = lambda if g(pi(n)) >= g(n-hat) else Lambda
    const f = this.g(state) + this.epsilon * this.h(state);
    const visitedMoves = Array.from(this.visited.keys());
    const mostRecentMove = visitedMoves[visitedMoves.length - 1];
    const wa = this.g(this.pi(state)) >= this.g(this.visited.get(mostRecentMove)) ? this.lambda : this.Lambda;
    this.pq.push([(1 + wa) * f, state]);
  }
};
