import * as nacl from 'tweetnacl';
import { Slicer, Uint8ArrayEqual } from '../../utils/src/util';
import { uint8 } from '../../uint8/src/uint8';
import { Shamir } from '../../shamir/src/shamir';

/**
 * The 'Signed' module wraps the Shamir library. It generates a random ed25519 keypair, and signs the shares with
 * the generated key. The signed object (a 'shard') is a share with its associated metadata.
 */
export module Signed {
  class SignedError extends Error {}
  class CryptoError extends SignedError {}

  /**
   * Shard is simple dataclass and byte packer/unpacker representing the signed content of a share and its metadata
   */
  export class Shard {
    static readonly KEYID_LENGTH = 16;

    /**
     * constructor for Shard. see description at the top of this class.
     *
     * @param keyID - key identifier. ${KEYID_LENGTH} bytes long.
     * @param t - the minimum number of shares needed to reassemble the secret value
     * @param n - the total number of shares generated when splitting the secret value
     * @param share - the contents of this particular share
     */
    constructor(
          readonly keyID: Uint8Array,
          readonly t: uint8,
          readonly n: uint8,
          readonly share: Uint8Array,
    ) {
      if (keyID.length !== Shard.KEYID_LENGTH) {
        throw new SyntaxError('invalid keyID size');
      }
      if (share.length < 2) {
        throw new SyntaxError('share length too short');
      }
    }

    pack(): Uint8Array {
      return Uint8Array.of(...this.keyID, this.t, this.n, ...this.share);
    }

    static unpack(bytes: Uint8Array | null): (Shard | null) {
      if (!bytes) {
        return null;
      }
      if (bytes.length < Shard.KEYID_LENGTH + 2) {
        throw new SyntaxError('share invalid -- too short');
      }

      const slicer = new Slicer(bytes);

      return new Shard(
        slicer.next(Shard.KEYID_LENGTH),
        <uint8>slicer.next(),
        <uint8>slicer.next(),
        slicer.next('end'),
      );
    }

    metadataEqual(that: Shard) : boolean {
      return this.n === that.n
              && this.t === that.t
              && Uint8ArrayEqual(this.keyID, that.keyID);
    }
  }

  /**
   * generate generates an ed25519 keypair, splits the private key via T of N shamir secret sharing, signs each share
   * (and the provided message) with that private key, and returns the public key, signed shards, and signed message.
   *
   * @param t - the minimum number of shards required to reassemble the private key.
   * @param n - the total number of shards generated for this key.
   * @param opts - optional additional arguments.
   *   @option message - an arbitrary message to sign with the generated private key.
   *   @option keyID - use this keyid (len = KEYID_LENGTH) instead of a randomly-generated one.
   *
   * @returns{
   *   publicKey - a generated ed25519 public key
   *   keyID - the key identifier
   *   shards[n] - share + key and split metadata, each signed with the generated ed25519 key.
   *   signedMessage? - message, signed with the generated ed25519 private key.
   * }
   */
  export function generate(t: uint8, n: uint8, opts: {message?:Uint8Array, keyID?:Uint8Array} = {}): {
      publicKey: Uint8Array,
      keyID: Uint8Array,
      shards: Uint8Array[],
      signedMessage: Uint8Array | null,
  } {
    const keys = nacl.sign.keyPair();
    let keyID : Uint8Array;
    if (opts.keyID != null) {
      if (opts.keyID.length !== Shard.KEYID_LENGTH) {
        throw new SyntaxError(`keyID must be ${Shard.KEYID_LENGTH} characters long`);
      }
      keyID = opts.keyID;
    } else {
      keyID = nacl.randomBytes(Shard.KEYID_LENGTH);
    }

    const shards: Uint8Array[] = [];

    Shamir.split(keys.secretKey, n, t).forEach((share: Uint8Array) => {
      shards.push(
        nacl.sign(
          new Shard(keyID, t, n, share).pack(),
          keys.secretKey,
        ),
      );
    });

    return {
      publicKey: keys.publicKey,
      keyID,
      shards,
      signedMessage: opts.message ? nacl.sign(opts.message, keys.secretKey) : null,
    };
  }

  /**
   * reconstruct reconstructs the private key from the given shards
   *
   * @param publicKey - public key used to validate these shards and split material.
   * @param shards - 2..n of the shards generated previously.
   * @return nacl.sign.keyPair.secretKey (as a Uint8Array)
   */
  export function reconstruct(publicKey: Uint8Array, shards: Uint8Array[]): Uint8Array {
    if (shards.length < 2) {
      throw new SyntaxError('2 or more shards are required for reassembly');
    }

    // Validate and inspect the metadata, by extracting it from the first share, and comparing it to the rest of 'em.
    const firstShard = Shard.unpack(nacl.sign.open(shards[0], publicKey));
    if (firstShard == null) {
      throw new SignedError('could not verify share[0]');
    }

    if (shards.length < firstShard.t) {
      throw new SyntaxError(`insufficient shards for reassembly. ${firstShard.t}..${firstShard.n} required.`);
    }
    if (shards.length > firstShard.n) {
      throw new SyntaxError(
        `more shards than expected. wanted ${firstShard.t}..${firstShard.n}, got ${shards.length}`,
      );
    }

    const shares: Uint8Array[] = [firstShard.share];

    shards.slice(1).forEach((signedShard: Uint8Array, index: number) => {
      const shard = Shard.unpack(nacl.sign.open(signedShard, publicKey));
      if (shard == null) {
        throw new CryptoError(`could not verify shard[${1 + index}]`);
      }
      if (!firstShard.metadataEqual(shard)) {
        throw new SignedError(`metadata mismatch for shard[${1 + index}]`);
      }
      shares.push(shard.share);
    });

    const keyPair = nacl.sign.keyPair.fromSecretKey(Shamir.combine(shares));
    return keyPair.secretKey;
  }
}
