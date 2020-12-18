type priorityFun<T> = (item: T) => number;

export default class PriorityQueue<T> {
  private heap: T[] = [];

  constructor(readonly getPriority: priorityFun<T>) {}

  get size(): number {
    return this.heap.length;
  }

  push(item: T): void {
    this.heap.push(item);
    this.fixUp(this.heap.length);
  }

  top(err?: string): T {
    if (this.heap.length === 0) {
      throw new Error(err || 'Access elements of an empty priority queue!');
    }
    return this.heap[0];
  }

  pop(): T {
    const val = this.top('Cannot pop elements from an empty priority queue!');
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.fixDown(1);
    return val;
  }

  private fixUp(k: number): void {
    let parent = Math.floor(k / 2);
    while (k > 1 && this.getPriority(this.heap[parent - 1]) < this.getPriority(this.heap[k - 1])) {
      const tmp = this.heap[k - 1];
      this.heap[k - 1] = this.heap[parent - 1];
      this.heap[parent - 1] = tmp;
      k = parent;
      parent = Math.floor(k / 2);
    }
  }

  private fixDown(k: number): void {
    while (2 * k <= this.heap.length) {
      let child = 2 * k;
      if (child < this.heap.length && this.getPriority(this.heap[child - 1]) < this.getPriority(this.heap[child])) child++;
      if (this.getPriority(this.heap[k - 1]) >= this.getPriority(this.heap[child - 1])) break;
      const tmp = this.heap[k - 1];
      this.heap[k - 1] = this.heap[child - 1];
      this.heap[child - 1] = tmp;
      k = child;
    }
  }
};
