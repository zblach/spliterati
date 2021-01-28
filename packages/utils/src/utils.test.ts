import takeNRandom, { Slicer, Uint8ArrayEqual } from './utils';

describe('Uint8ArrayEquals', () => {
  const arr = Uint8Array.of(1, 2, 3, 4, 5);

  test('equal', () => {
    const arr2 = Uint8Array.of(1, 2, 3, 4, 5);
    expect(Uint8ArrayEqual(arr, arr2)).toBeTruthy();
  });

  test('short a', () => {
    const a = Uint8Array.of(1);
    expect(Uint8ArrayEqual(a, arr)).toBeFalsy();
  });

  test('short b', () => {
    const b = Uint8Array.of(1);
    expect(Uint8ArrayEqual(arr, b)).toBeFalsy();
  });
});

describe('slicer', () => {
  test('"aaaabbcdeeeee"', () => {
    const slicer = new Slicer('aaaabbcdeeeee');

    expect(slicer.next(4)).toEqual('aaaa');
    expect(slicer.next(2)).toEqual('bb');
    expect(slicer.next(1)).toEqual('c');

    expect(slicer.next()).toEqual('d');

    expect(slicer.next('end')).toEqual('eeeee');
  });

  test('[1, 2, 3, 4, 5, 6]', () => {
    const slicer = new Slicer([1, 2, 3, 4, 5, 6]);

    expect(slicer.next(2)).toEqual([1, 2]);
    expect(slicer.next(1)).toEqual([3]);

    expect(slicer.next()).toEqual(4);

    expect(slicer.next('end')).toEqual([5, 6]);
  });
});

describe('takeNRandom', () => {
  const arr = [1, 2, 3, 4, 5];

  test('all', () => {
    const ret = takeNRandom(5, arr);

    expect(ret.length).toEqual(5);

    // symmetric subsets means equality of items
    expect(arr).toEqual(expect.arrayContaining(ret));
    expect(ret).toEqual(expect.arrayContaining(arr));
  });

  test('some', () => {
    const ret = takeNRandom(3, arr);

    expect(ret.length).toEqual(3);
    expect(arr).toEqual(expect.arrayContaining(ret));
  });

  test('none', () => {
    const ret = takeNRandom(0, arr);

    expect(ret).not.toContain(expect.anything());
  });
});
