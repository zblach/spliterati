import { randomBytes } from 'crypto';
import type { uint8 } from '@spliterati/uint8';
import takeNRandom from '@spliterati/utils';

/**
 * Operations over a Galois field of 2^8
 */
export module GF2p8 {
  export const FIELD = 2 ** 8;

  const logTable: uint8[] = [
    0x00, 0xff, 0xc8, 0x08, 0x91, 0x10, 0xd0, 0x36,
    0x5a, 0x3e, 0xd8, 0x43, 0x99, 0x77, 0xfe, 0x18,
    0x23, 0x20, 0x07, 0x70, 0xa1, 0x6c, 0x0c, 0x7f,
    0x62, 0x8b, 0x40, 0x46, 0xc7, 0x4b, 0xe0, 0x0e,
    0xeb, 0x16, 0xe8, 0xad, 0xcf, 0xcd, 0x39, 0x53,
    0x6a, 0x27, 0x35, 0x93, 0xd4, 0x4e, 0x48, 0xc3,
    0x2b, 0x79, 0x54, 0x28, 0x09, 0x78, 0x0f, 0x21,
    0x90, 0x87, 0x14, 0x2a, 0xa9, 0x9c, 0xd6, 0x74,
    0xb4, 0x7c, 0xde, 0xed, 0xb1, 0x86, 0x76, 0xa4,
    0x98, 0xe2, 0x96, 0x8f, 0x02, 0x32, 0x1c, 0xc1,
    0x33, 0xee, 0xef, 0x81, 0xfd, 0x30, 0x5c, 0x13,
    0x9d, 0x29, 0x17, 0xc4, 0x11, 0x44, 0x8c, 0x80,
    0xf3, 0x73, 0x42, 0x1e, 0x1d, 0xb5, 0xf0, 0x12,
    0xd1, 0x5b, 0x41, 0xa2, 0xd7, 0x2c, 0xe9, 0xd5,
    0x59, 0xcb, 0x50, 0xa8, 0xdc, 0xfc, 0xf2, 0x56,
    0x72, 0xa6, 0x65, 0x2f, 0x9f, 0x9b, 0x3d, 0xba,
    0x7d, 0xc2, 0x45, 0x82, 0xa7, 0x57, 0xb6, 0xa3,
    0x7a, 0x75, 0x4f, 0xae, 0x3f, 0x37, 0x6d, 0x47,
    0x61, 0xbe, 0xab, 0xd3, 0x5f, 0xb0, 0x58, 0xaf,
    0xca, 0x5e, 0xfa, 0x85, 0xe4, 0x4d, 0x8a, 0x05,
    0xfb, 0x60, 0xb7, 0x7b, 0xb8, 0x26, 0x4a, 0x67,
    0xc6, 0x1a, 0xf8, 0x69, 0x25, 0xb3, 0xdb, 0xbd,
    0x66, 0xdd, 0xf1, 0xd2, 0xdf, 0x03, 0x8d, 0x34,
    0xd9, 0x92, 0x0d, 0x63, 0x55, 0xaa, 0x49, 0xec,
    0xbc, 0x95, 0x3c, 0x84, 0x0b, 0xf5, 0xe6, 0xe7,
    0xe5, 0xac, 0x7e, 0x6e, 0xb9, 0xf9, 0xda, 0x8e,
    0x9a, 0xc9, 0x24, 0xe1, 0x0a, 0x15, 0x6b, 0x3a,
    0xa0, 0x51, 0xf4, 0xea, 0xb2, 0x97, 0x9e, 0x5d,
    0x22, 0x88, 0x94, 0xce, 0x19, 0x01, 0x71, 0x4c,
    0xa5, 0xe3, 0xc5, 0x31, 0xbb, 0xcc, 0x1f, 0x2d,
    0x3b, 0x52, 0x6f, 0xf6, 0x2e, 0x89, 0xf7, 0xc0,
    0x68, 0x1b, 0x64, 0x04, 0x06, 0xbf, 0x83, 0x38,
  ];

  const expTable: uint8[] = [
    0x01, 0xe5, 0x4c, 0xb5, 0xfb, 0x9f, 0xfc, 0x12,
    0x03, 0x34, 0xd4, 0xc4, 0x16, 0xba, 0x1f, 0x36,
    0x05, 0x5c, 0x67, 0x57, 0x3a, 0xd5, 0x21, 0x5a,
    0x0f, 0xe4, 0xa9, 0xf9, 0x4e, 0x64, 0x63, 0xee,
    0x11, 0x37, 0xe0, 0x10, 0xd2, 0xac, 0xa5, 0x29,
    0x33, 0x59, 0x3b, 0x30, 0x6d, 0xef, 0xf4, 0x7b,
    0x55, 0xeb, 0x4d, 0x50, 0xb7, 0x2a, 0x07, 0x8d,
    0xff, 0x26, 0xd7, 0xf0, 0xc2, 0x7e, 0x09, 0x8c,
    0x1a, 0x6a, 0x62, 0x0b, 0x5d, 0x82, 0x1b, 0x8f,
    0x2e, 0xbe, 0xa6, 0x1d, 0xe7, 0x9d, 0x2d, 0x8a,
    0x72, 0xd9, 0xf1, 0x27, 0x32, 0xbc, 0x77, 0x85,
    0x96, 0x70, 0x08, 0x69, 0x56, 0xdf, 0x99, 0x94,
    0xa1, 0x90, 0x18, 0xbb, 0xfa, 0x7a, 0xb0, 0xa7,
    0xf8, 0xab, 0x28, 0xd6, 0x15, 0x8e, 0xcb, 0xf2,
    0x13, 0xe6, 0x78, 0x61, 0x3f, 0x89, 0x46, 0x0d,
    0x35, 0x31, 0x88, 0xa3, 0x41, 0x80, 0xca, 0x17,
    0x5f, 0x53, 0x83, 0xfe, 0xc3, 0x9b, 0x45, 0x39,
    0xe1, 0xf5, 0x9e, 0x19, 0x5e, 0xb6, 0xcf, 0x4b,
    0x38, 0x04, 0xb9, 0x2b, 0xe2, 0xc1, 0x4a, 0xdd,
    0x48, 0x0c, 0xd0, 0x7d, 0x3d, 0x58, 0xde, 0x7c,
    0xd8, 0x14, 0x6b, 0x87, 0x47, 0xe8, 0x79, 0x84,
    0x73, 0x3c, 0xbd, 0x92, 0xc9, 0x23, 0x8b, 0x97,
    0x95, 0x44, 0xdc, 0xad, 0x40, 0x65, 0x86, 0xa2,
    0xa4, 0xcc, 0x7f, 0xec, 0xc0, 0xaf, 0x91, 0xfd,
    0xf7, 0x4f, 0x81, 0x2f, 0x5b, 0xea, 0xa8, 0x1c,
    0x02, 0xd1, 0x98, 0x71, 0xed, 0x25, 0xe3, 0x24,
    0x06, 0x68, 0xb3, 0x93, 0x2c, 0x6f, 0x3e, 0x6c,
    0x0a, 0xb8, 0xce, 0xae, 0x74, 0xb1, 0x42, 0xb4,
    0x1e, 0xd3, 0x49, 0xe9, 0x9c, 0xc8, 0xc6, 0xc7,
    0x22, 0x6e, 0xdb, 0x20, 0xbf, 0x43, 0x51, 0x52,
    0x66, 0xb2, 0x76, 0x60, 0xda, 0xc5, 0xf3, 0xf6,
    0xaa, 0xcd, 0x9a, 0xa0, 0x75, 0x54, 0x0e, 0x01,
  ];

  /**
   * A simplification of the constant-time check used in mul and div.
   *
   * It is equivalent to:
   *  `cond == 0 ? 0 : value`
   *
   * @param cond  - test value
   * @param value - potential output
   * @returns 0, if ${cond} == 0, else ${value}
   */
  /* eslint-disable no-bitwise */
  const zeroIfZero = (cond: uint8, value: uint8): uint8 => {
    let mask: uint8 = cond;
    mask |= (mask << 4) | (mask >> 4);
    mask |= (mask << 2) | (mask >> 2);
    mask |= (mask << 1) | (mask >> 1);
    /*
     tl;dr: mask = cond == 0 ? 0 : 0xFF;

     mask = 'abcdefgh' (as bits)
            // (a | b) == (ab) for compactness, and brackets encapsulate one bit.

     mask = '(ae)(bf)(cg)(dh)(ea)(fb)(gc)(hd)'
     mask = '(aecg)(bfdh)(cgeaae)(dhfbbf)(eagccg)(fbhddh)(gcea)(hdfb)'
     mask = '(aecgbfdh)(bfdhcgeaaeaecg)(cgeaaedhfbbfbfdh)(dhfbbfeagccgcgeaae)' +
            '(eagccgfbhddhdhfbbf)(fbhddhgceaeagccg)(gceahdfbfbhddh)(hdfbgcea)'

            // sorted (ba) == (ab) etc., reflexivity.
         == '(abcdefgh)(aaabccdeeefggh)(aabbbcddeefffghh)(aaabbcccdeeeffgggh)' +
            '(abbbccdddefffgghhh)(aabcccddeefggghh)(abbcdddeffghhh)(abcdefgh)'

            // simplified (aa) == (a) etc., identity.
         == '(abcdefgh)(abcdefgh)(abcdefgh)(abcdefgh)' +
            '(abcdefgh)(abcdefgh)(abcdefgh)(abcdefgh)'

         == cond == 0 ? 0 : 0xFF;
     */

    return <uint8>(mask & value);
  };
  /* eslint-enable no-bitwise */

  // eslint-disable-next-line no-bitwise
  const xor = (a: uint8, b: uint8): uint8 => <uint8>(a ^ b);

  const mul = (a: uint8, b: uint8): uint8 => {
    const sum = (logTable[a] + logTable[b]) % (FIELD - 1);

    return zeroIfZero(b, zeroIfZero(a, expTable[sum]));
  };

  const div = (a: uint8, b: uint8): uint8 => {
    if (b === 0) {
      throw new RangeError('div zero');
    }

    const fm1 = FIELD - 1;
    const diff = ((logTable[a] - logTable[b]) + fm1) % fm1;

    return zeroIfZero(a, expTable[diff]);
  };

  export class Polynomial {
    private readonly coefficients: Uint8Array; // [0] = x intercept

    /**
     * Constructs a random function of degree ${degree}, with an x-intercept of ${intercept}
     *
     * @param {uint8} intercept - the value of the function at x==0
     * @param {uint8} degree - the degree of the function
     */
    constructor(intercept: uint8, degree: uint8) {
      this.coefficients = Uint8Array.of(intercept, ...randomBytes(degree));
    }

    /**
     * Compute the y-value of a function, given the existing polynomial definition
     *
     * @param {uint8} x - the x-coordinate at which to compute the function value
     *
     * @returns {uint8} - the value of the function at ${x}
     */
    evaluate(x: uint8): uint8 {
      if (x === 0) {
        return <uint8> this.coefficients[0];
      }

      const degree: uint8 = <uint8>(this.coefficients.length - 1);
      let out = this.coefficients[degree];

      for (let i = degree - 1; i >= 0; i--) {
        out = xor(mul(<uint8>out, x), <uint8> this.coefficients[i]);
      }

      return <uint8>out;
    }

    /**
     * Compute the y-value of a function, given candidate points defining that function.
     *
     * @param {Uint8Array} xs - known x-intercepts (paired to ${xs})
     * @param {Uint8Array} ys - known y-intercepts (paired to ${ys})
     * @param {uint8}       x - candidate x-value for interpolation
     *
     * @return {uint8}          the y-value for the function at ${x}
     */
    static interpolate(xs: Uint8Array, ys: Uint8Array, x: uint8): uint8 {
      let result: uint8 = 0;
      let basis: uint8 = 0;

      if (xs.length !== ys.length) {
        throw new SyntaxError('xs.length != ys.length');
      }
      const pairCount = xs.length;

      for (let i = 0; i < pairCount; i++) {
        basis = 1;
        for (let j = 0; j < pairCount; j++) {
          if (i === j) {
            // eslint-disable-next-line no-continue
            continue;
          }
          basis = mul(basis, div(xor(x, <uint8>xs[j]), xor(<uint8>xs[i], <uint8>xs[j])));
        }
        result = xor(result, mul(<uint8>ys[i], basis));
      }

      return result;
    }
  }
}

export module Shamir {
  /**
   * split uses shamir secret sharing to divide the secret ${data} into ${n} parts,
   * requiring ${t} or more to reassemble.
   *
   * Each share is one byte longer than the provided ${data} value.
   *
   * @param {Uint8Array} data - the secret data to be split
   * @param {uint8}         n - the total number of shares
   * @param {uint8}         t - the minimum number of shares required for reassembly
   *
   * @return {Uint8Array[n]}  - the shares (in the form of (...y[0:len(data)], x), for unique x in (1..255))
   */
  export function split(data: Uint8Array, n: uint8, t: uint8): Uint8Array[] {
    if (t > n) {
      throw new SyntaxError('threshold greater than shard count');
    }
    if (t < 2) {
      throw new SyntaxError('threshold must be greater than 1');
    }
    if (data.length === 0) {
      throw new SyntaxError('data required for split');
    }
    if (n >= GF2p8.FIELD - 1) {
      throw new SyntaxError('too many shares for this field');
    }

    const out: Uint8Array[] = [];
    const xs = takeNRandom(n, [...Array(GF2p8.FIELD - 1).keys()]); // 0 ... 254
    for (let i = 0; i < n; i++) {
      out[i] = new Uint8Array(data.length + 1);

      xs[i] += 1; // 1 ... 255
      out[i][data.length] = xs[i];
    }
    data.forEach((val, idx) => {
      const p = new GF2p8.Polynomial(<uint8>val, <uint8>(t - 1));
      xs.forEach((x: number, i: number) => {
        out[i][idx] = p.evaluate(<uint8>x);
      });
    });

    return out;
  }

  /**
   * combine recomputes the data split by ${split}, given ${t} or more shares of the same operation.
   *
   * NOTE: if less than ${t} shares are provided, nonsense value will be returned.
   * NOTE: if shares are provided from different splits, nonsense value will be returned.
   *
   * @param {Uint8Array[]} shares - ${t}..${n} shares of a split secret
   *
   * @return {Uint8Array} - the reassembled secret (see NOTEs)
   */
  export function combine(shares: Uint8Array[]): Uint8Array {
    if (shares.length < 2) {
      throw new SyntaxError('need 2 or more shares');
    }

    const expectedLen = shares[0].length;
    shares.slice(1).forEach((share) => {
      if (share.length !== expectedLen) {
        throw new SyntaxError('unequal share lengths');
      }
    });

    const secret = new Uint8Array(expectedLen - 1);
    const xSamples = new Uint8Array(shares.length);
    const ySamples = new Uint8Array(shares.length);
    const uniqueX = new Set<uint8>();

    shares.forEach((part, i) => {
      const x = <uint8>part[expectedLen - 1];
      if (uniqueX.has(x)) {
        throw new SyntaxError('duplicate x values for shares not allowed');
      }
      uniqueX.add(x);
      xSamples[i] = x;
    });

    for (let c = 0; c < secret.length; c++) {
      shares.forEach((part, i) => {
        ySamples[i] = part[c];
      });

      secret[c] = GF2p8.Polynomial.interpolate(xSamples, ySamples, 0);
    }

    return secret;
  }
}
