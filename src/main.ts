import "./style.css";
import { getById } from "phil-lib/client-misc";

const mainTable = getById("main", HTMLTableElement);

class BoardState {
  readonly positions: ReadonlyArray<number>;

  private readonly valid: boolean;

  readonly size: number;

  draw() {
    mainTable.innerText = "";
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      const tr = mainTable.insertRow();
      for (let columnIndex = 0; columnIndex < this.size; columnIndex++) {
        const td = tr.insertCell();
        const columnForQ = this.positions[rowIndex];
        if (columnForQ !== undefined && columnForQ == columnIndex) {
          td.innerText = "Q";
        }
      }
    }
  }

  private constructor(size: number);
  private constructor(source: BoardState, newMove: number);
  private constructor(first: number | BoardState, second?: number | undefined) {
    if (typeof first == "number") {
      this.positions = [];
      this.size = first;
      this.valid = true;
    } else {
      if (second === undefined) {
        throw new Error("assertion failed.");
      }
      const source = first;
      const newMove = second;
      if (!source.valid) {
        throw new Error("assertion failed.");
      }
      if (source.finished) {
        throw new Error("assertion failed.");
      }
      if (newMove < 0 || newMove >= source.size) {
        throw new Error("assertion failed.");
      }
      this.positions = [...source.positions, newMove];
      this.size = source.size;
      let validSoFar = true;
      const newRowIndex = source.positions.length;
      for (let row = 0; validSoFar && row < source.positions.length; row++) {
        const column = source.positions[row];
        if (column == newMove) {
          validSoFar = false;
        } else {
          const rowOffset = newRowIndex - row;
          const columnOffset = Math.abs(column - newMove);
          if (rowOffset == columnOffset) {
            validSoFar = false;
          }
        }
      }

      this.valid = validSoFar;
    }
  }

  static start(size: number) {
    return new this(size);
  }

  oneStep(): BoardState[] {
    if (!this.valid) {
      throw new Error("assertion failed.");
    }
    if (this.finished) {
      throw new Error("assertion failed");
    }
    const result: BoardState[] = [];
    for (let newMove = 0; newMove < this.size; newMove++) {
      const possible = new BoardState(this, newMove);
      if (possible.valid) {
        result.push(possible);
      }
    }
    return result;
  }

  get finished() {
    return this.positions.length == this.size;
  }

  solve(): BoardState | undefined {
    if (!this.valid) {
      throw new Error("assertion failed.");
    }
    if (this.finished) {
      return this;
    } else {
      const allPossibleNext = this.oneStep();
      for (const next of allPossibleNext) {
        const result = next.solve();
        if (result) {
          return result;
        }
      }
      return undefined;
    }
  }
}

(window as any).debug = { BoardState: BoardState };
