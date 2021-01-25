import { randomInt } from 'crypto';

export default function takeNRandom<T>(n: number, elements: T[]): T[] {
  if (n > elements.length) {
    throw new SyntaxError('cannot take more elements than there are');
  }
  const shuf: T[] = [...elements];
  for (let i = shuf.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [shuf[i], shuf[j]] = [shuf[j], shuf[i]];
  }
  return shuf.slice(0, n);
}
