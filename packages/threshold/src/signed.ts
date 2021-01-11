import {uint8} from "../../shamir/src/uint8";
import * as nacl from "tweetnacl";
import {Shamir} from "../../shamir/src/shamir";
import {Slicer, Uint8ArrayEqual} from "./util";

/**
 * The 'Signed' module wraps the Shamir library. It generates a random ed25519 keypair, and signs the shares with
 * the generated key. The signed object (a 'shard') is a share with its associated metadata.
 */
export module Signed {
    const KEYID_LENGTH = 16;
    class Shard {
        constructor(
            readonly keyID: Uint8Array,
            readonly t: uint8,
            readonly n: uint8,
            readonly share: Uint8Array) {

            if (keyID.length != KEYID_LENGTH) {
                throw new SyntaxError("invalid keyID size")
            }
            if (share.length < 2) {
                throw new SyntaxError("share length too short")
            }
        }

        pack(): Uint8Array {
            return Uint8Array.of(...this.keyID, this.t, this.n, ...this.share)
        }

        static unpack(bytes: Uint8Array | null): (Shard | null) {
            if (!bytes) {
                return null;
            }
            if (bytes.length < KEYID_LENGTH+2) {
                throw new SyntaxError("share invalid -- too short")
            }

            const slicer = new Slicer();

            return new Shard(
                bytes.slice(...slicer.nextRange(KEYID_LENGTH)),
                <uint8>bytes[slicer.next()],
                <uint8>bytes[slicer.next()],
                bytes.slice(slicer.next())
            )
        }

        metadataEqual(that: Shard) : boolean {
            return this.n == that.n &&
                this.t == that.t &&
                Uint8ArrayEqual(this.keyID, that.keyID);
        }
    }

    /**
     * generate generates an ed25519 keypair, splits the private key via T of N shamir secret sharing, signs each share (and
     * the provided message) with that private key, and returns the public key, signed shards, and signed message.
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
    export function generate(t: uint8, n: uint8, opts: {message?:Uint8Array, keyID?:Uint8Array}): {
        publicKey: Uint8Array,
        keyID: Uint8Array,
        shards: Uint8Array[],
        signedMessage: Uint8Array | null,
    } {
        const keys = nacl.sign.keyPair()
        if (opts.keyID != null && opts.keyID.length != KEYID_LENGTH) {
            throw new SyntaxError(`keyID must be ${KEYID_LENGTH} characters long`)
        } else {
            opts.keyID = nacl.randomBytes(KEYID_LENGTH);
        }

        const shards: Uint8Array[] = []

        Shamir.split(keys.secretKey, n, t).forEach((share: Uint8Array) => {
            shards.push(nacl.sign(new Shard(<Uint8Array>opts.keyID, t, n, share).pack(), keys.secretKey))
        })

        return {
            publicKey: keys.publicKey,
            keyID: opts.keyID,
            signedMessage: opts.message? nacl.sign(opts.message, keys.secretKey) : null,
            shards: shards
        }
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
            throw new Error("2 or more shards are required for reassembly")
        }

        // Validate and inspect the metadata, by extracting it from the first share, and comparing it to the rest of 'em.
        const firstShard = Shard.unpack(nacl.sign.open(shards[0], publicKey))
        if (firstShard == null) {
            throw new Error("could not verify share[0]")
        }

        if (shards.length < firstShard.t) {
            throw new Error(`insufficient shards for reassembly. ${firstShard.t}..${firstShard.n} required.`)
        }
        if (shards.length > firstShard.n) {
            throw new Error(`more shards than expected. wanted ${firstShard.t}..${firstShard.n}, got ${shards.length}`)
        }

        const shares: Uint8Array[] = [firstShard.share]

        shards.slice(1).forEach((signedShard: Uint8Array, index: number) => {
            const shard = Shard.unpack(nacl.sign.open(signedShard, publicKey))
            if (shard == null) {
                throw new Error(`could not verify shard[${1 + index}]`)
            }
            if (!firstShard.metadataEqual(shard)) {
                throw new Error(`metadata mismatch for shard[${1 + index}]`)
            }
            shares.push(shard.share)
        })

        const keyPair = nacl.sign.keyPair.fromSecretKey(Shamir.combine(shares))
        if (!Uint8ArrayEqual(keyPair.publicKey, publicKey)) {
            throw new Error("could not reconstruct expected private key")
        }

        return keyPair.secretKey
    }
}
