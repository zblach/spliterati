import {Signed} from "./signed";
import nacl = require("tweetnacl");

describe("test", () => {
   test("roundtrip", () => {
       const res = Signed.generate(3, 5, {message: Uint8Array.of(5, 4, 3, 2, 1)})

       const pk = Signed.reconstruct(res.publicKey, res.shards)

       const pub = nacl.sign.keyPair.fromSecretKey(pk)
       nacl.sign.open(<Uint8Array>res.signedMessage, pub.publicKey)
   })
})
