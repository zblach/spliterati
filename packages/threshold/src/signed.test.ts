import * as nacl from 'tweetnacl';

import { randomBytes, randomInt } from 'crypto';
import type { uint8 } from '@spliterati/uint8';
import { Signed } from './signed';

const sealedbox = require('tweetnacl-sealedbox-js');

describe('test', () => {
  test('roundtrip', () => {
    const secretPayload = Uint8Array.of(...randomBytes(32));
    const message = Uint8Array.of(...randomBytes(16));

    // generate shares
    const res = Signed.generate(3, 5, { message });

    // validate message
    expect(nacl.sign.open(res.signedMessage!, res.signingPublicKey)).toEqual(message);

    // encrypt local secret
    const sb = sealedbox.seal(secretPayload, res.encryptionPublicKey);

    // reconstruct shares
    const reconst = Signed.reconstruct(res.signingPublicKey, res.shards);

    // decrypt local secret
    expect(sealedbox.open(sb, reconst.encryptionKeyPair.publicKey, reconst.encryptionKeyPair.secretKey))
      .toEqual(secretPayload);
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
