import * as nacl from 'tweetnacl';
import { randomBytes, randomInt } from 'crypto';
import { uint8 } from '@spliterati/shamir/src/uint8';
import { Signed } from './signed';

describe('test', () => {
  test('roundtrip', () => {
    const res = Signed.generate(3, 5, { message: Uint8Array.of(5, 4, 3, 2, 1) });

    const pk = Signed.reconstruct(res.publicKey, res.shards);

    const pub = nacl.sign.keyPair.fromSecretKey(pk);
    nacl.sign.open(<Uint8Array>res.signedMessage, pub.publicKey);
  });

  describe('shard tests', () => {
    test('pack', () => {
      const keyID = Uint8Array.of(...randomBytes(Signed.Shard.KEYID_LENGTH));
      const t = <uint8> randomInt(0, 255);
      const n = <uint8> randomInt(0, 255);
      const data = Uint8Array.of(...randomBytes(randomInt(2, 48)));

      const shard = new Signed.Shard(keyID, t, n, data);

      const bytes = shard.pack();

      const reshard = Signed.Shard.unpack(bytes);

      expect(reshard).not.toBeNull();

      if (reshard) {
        expect(reshard.keyID).toEqual(keyID);
        expect(reshard.t).toEqual(t);
        expect(reshard.n).toEqual(n);
        expect(reshard.share).toEqual(data);
      }
    });
  });
});
