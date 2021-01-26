import { randomBytes, randomInt } from 'crypto';
import { uint8 } from '../../uint8/src/uint8';
import { GF2p8, Shamir } from './shamir';
import takeNRandom from '../../utils/src/util';

describe.skip('iterative roundtrip', () => {
  return; // remove to run these tests -- `describe.skip` will still generate skipped output for ${TEST_COUNT} cases.
  const TEST_COUNT = 5000;
  const iter = (k: uint8, t: uint8, n: uint8) => () => {
    const secret = Uint8Array.from(randomBytes(randomInt(1, 64)));
    const shares = Shamir.split(secret, n, t);

    const recombine = Shamir.combine(takeNRandom(k, shares));
    expect(secret).toEqual(recombine);
  };
  for (let i = 0; i < TEST_COUNT; i++) {
    const t = <uint8>randomInt(2, 254);
    const n = <uint8>randomInt(t, 255);
    const k = <uint8>(t == n ? t : randomInt(t, n));

    test(`test ${i}: ${k} of ${t} of ${n}`, iter(k, t, n));
  }
});

describe('split', () => {
  const knownSecret = Uint8Array.of(0x68, 0x65, 0x6c, 0x6c, 0x6f);
  test('split test', () => {
    const shares = Shamir.split(knownSecret, 5, 3);
    expect(shares).toHaveLength(5);
    shares.forEach((share: Uint8Array) => {
      expect(share).toHaveLength(6);
    });
  });

  test('too few shares', () => {
    expect(() => {
      Shamir.split(knownSecret, 1, 1);
    }).toThrow(SyntaxError);
  });
  test('too many shares', () => {
    expect(() => {
      Shamir.split(knownSecret, 255, 5);
    }).toThrow(SyntaxError);
  });
  test('t > n', () => {
    expect(() => {
      Shamir.split(knownSecret, 3, 5);
    }).toThrow(SyntaxError);
  });
  test('no data', () => {
    expect(() => {
      Shamir.split(Uint8Array.of(), 3, 5);
    }).toThrow(SyntaxError);
  });

  test('assembly', () => {
    const foo = GF2p8.Polynomial.interpolate(
      Uint8Array.of(1, 2, 3, 4, 5),
      Uint8Array.of(146, 63, 42, 146, 130),
      0,
    );

    expect(foo).toEqual(63);
  });
});

describe('combine', () => {
  // 'hello', 5, 3
  const knownSecret = Uint8Array.of(0x68, 0x65, 0x6c, 0x6c, 0x6f);
  const knownShares = [
    Uint8Array.of(0xe7, 0xa3, 0xc6, 0xab, 0xde, 0x58),
    Uint8Array.of(0xc1, 0xf2, 0x5f, 0x83, 0x62, 0x7a),
    Uint8Array.of(0xd5, 0xf0, 0x58, 0x2a, 0xf1, 0x74),
    Uint8Array.of(0x71, 0x47, 0x25, 0x86, 0x35, 0x8b),
    Uint8Array.of(0x6b, 0xbe, 0x70, 0x7b, 0xf4, 0xc3),
  ];

  describe('golang shares (3/5)', () => {
    test('0..2', () => {
      expect(
        Shamir.combine(knownShares.slice(0, 3)),
      ).toEqual(knownSecret);
    });
    test('1..3', () => {
      expect(
        Shamir.combine(knownShares.slice(1, 4)),
      ).toEqual(knownSecret);
    });
    test('2..4', () => {
      expect(
        Shamir.combine(knownShares.slice(2)),
      ).toEqual(knownSecret);
    });
    test('4, 2, 0', () => {
      expect(
        Shamir.combine([knownShares[4], knownShares[2], knownShares[0]]),
      ).toEqual(knownSecret);
    });
  });
  test('golang shares (5/5)', () => {
    expect(
      Shamir.combine(knownShares),
    ).toEqual(knownSecret);
  });

  test('golang shares (2/5)', () => {
    const reassembled = Shamir.combine(knownShares.slice(0, 2));
    expect(reassembled).toHaveLength(5);
    expect(reassembled).not.toEqual(knownSecret);
  });

  test('no shares to fail', () => {
    expect(() => {
      Shamir.combine([]);
    }).toThrow(SyntaxError);
  });
  test('single share to fail', () => {
    expect(() => {
      Shamir.combine([knownShares[0]]);
    }).toThrow(SyntaxError);
  });
  test('duplicate x shares to fail', () => {
    expect(() => {
      Shamir.combine([
        Uint8Array.of(0x01, 0x02, 0x10),
        Uint8Array.of(0x03, 0x04, 0x10),
      ]);
    }).toThrow(SyntaxError);
  });
  test('mismatched shard lengths to fail', () => {
    expect(() => {
      Shamir.combine([
        Uint8Array.of(0x01, 0x02, 0x03),
        Uint8Array.of(0x04, 0x05),
      ]);
    }).toThrow(SyntaxError);
  });
});
