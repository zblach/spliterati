# `shamir`

This library is a port of the arbitrary-length per-byte shamir secret sharing implementation from [Hashicorp's Vault](https://github.com/hashicorp/vault/blob/master/shamir/shamir.go) product.

I have removed the constant runtime functionality from the galois field arithmetic.

## Usage

```typescript
import {Shamir} from './shamir';

const shares = Shamir.split(secret, 5, 3);

const reassembled = Shamir.combine([shares[0], shares[3], shares[1]]);

expect(secret).toEqual(reassembled);

```
