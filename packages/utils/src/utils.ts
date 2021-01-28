import { randomInt } from 'crypto';

/**
 * Checks to see if two Uint8Arrays have the same contents.
 *
 * @param a - the first Uint8Array
 * @param b - the second Uint8Array
 * @return boolean - whether or not they are equal.
 */
export function Uint8ArrayEqual(a: Uint8Array, b: Uint8Array): boolean {
  let one : Uint8Array;
  let two: Uint8Array;

  // eslint-disable-next-line prefer-const
  [one, two] = a.length < b.length ? [a, b] : [b, a];

  // eslint-disable-next-line no-bitwise
  return one.reduce((bs, val, i) => bs | (two[i] ^ val), a.length ^ b.length) === 0;
}

interface Sliceable<T> extends ArrayLike<T>{
  slice(arg0?: number, arg1?: number): this;
}
type index = number | 'end'
/**
 * Slicer is a utility class that keeps track of a slice index for repeated array cuts. It doesn't track array length.
 *
 * Say, for example, you have a Uint8Array that looks something like:
 *   aaaaaaaabbccccdeffff....
 *
 * It's annoying to keep track of how far you've read manually, so you can decompose it as follows:
 *   const s = new Slicer(ex);
 *
 *   const as = s.next(8); // 8 = the length of this particular section
 *   const bs = s.next(2);
 *   const cs = s.next(4);
 *   const ds = s.next(1); // array of length 1
 *   const e  = s.next();  // singular element.
 *   const fs = s.next('end'); // until the end.
 */
export class Slicer<E, ES extends Sliceable<E>> {
  private index : number;

  constructor(private readonly data: ES) {
    this.index = 0;
  }

  next(): E; // singular element

  next(amt: index): ES; // slices of defined or indefinite length

  next(amt?: index): (ES | E) {
    let end: (number | undefined);
    switch (amt) {
      case undefined:
        return this.data[this.index++];
      case 'end':
        break;
      default:
        end = this.index + amt;
        break;
    }
    const slice = this.data.slice(this.index, end);
    this.index = (amt == 'end' ? this.data.length : <number>end);
    return slice;
  }
}

/**
 * takeNRandom takes a random {n} elements from a shuffled shallow-copy of {elements}
 *
 * @param n - the number of elements to take
 * @param elements - the elements to take pick from
 */
export default function takeNRandom<T>(n: number, elements: T[]): T[] {
  if (n > elements.length) {
    throw new SyntaxError('cannot take more elements than there are');
  } else if (n < 0) {
    throw new SyntaxError('cannot return a negative number of elements');
  }

  switch (n) {
    case 0:
      return [];
    case 1:
      return [elements[randomInt(elements.length)]];
    default:
  }
  const shuf: T[] = [...elements];
  for (let i = shuf.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [shuf[i], shuf[j]] = [shuf[j], shuf[i]];
  }
  return shuf.slice(0, n);
}
