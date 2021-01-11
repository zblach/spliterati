# `threshold`

These modules are wrappers around the `shamir` library which abstract out some of the key generation and message integrity functions. 

They're made for secret generation rather than splitting pre-existing material.

## Usage

```typescript
import {Signed} from './threshold';

const message: Uint8Array
// ...

// this function internally generates an ed25519 keypair. 
const res = Signed.generate(3, 5, {message: message})
//   res.publicKey == ed25519 key. Encrypt stuff with it.
//   res.shards == signed, wrapped shares of the private key.

// ...

// generated public key is used to verify the shares.
const privKey = Signed.reconstruct(res.publicKey, [res.shards[0], res.shads[3], res.shards[1]])
// now you have the private key.

```
