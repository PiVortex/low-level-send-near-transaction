const { connect, transactions, utils, KeyPair } = require('near-api-js');
const sha256 = require('js-sha256');

const connectionConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

async function main() {
    const near = await connect(connectionConfig);

    const sender = "pivortex.testnet";
    const receiver = "icespice.testnet";
    const actions = [transactions.transfer("1000000000000000000000000")];
    
    // Fill in public key
    const pubKey = "";
    const publicKey = utils.PublicKey.fromString(pubKey);

    // Fill in private key
    const privateKey = "";
    const keyPair = KeyPair.fromString(privateKey);

    // Get nonce
    const accessKey = await near.connection.provider.query(
        `access_key/${sender}/${publicKey.toString()}`,
        ""
      );
    const nonce = ++accessKey.nonce;

    // Get block hash
    const recentBlockHash = utils.serialize.base_decode(
        accessKey.block_hash
      );

    // Create transaction
    const transaction = transactions.createTransaction(
        sender,
        publicKey,
        receiver,
        nonce,
        actions,
        recentBlockHash
      );

    // Get txHash from transaction
    const serializedTx = utils.serialize.serialize(
      transactions.SCHEMA.Transaction,
      transaction
    );
    const txHash = new Uint8Array(sha256.sha256.array(serializedTx));

    // Get signature
    const signature = keyPair.sign(txHash);

    // Check if signature is valid
    const isValid = keyPair.verify(txHash, signature.signature);
    console.log(isValid); 

    // Create signed transaction
    const signedTransaction = new transactions.SignedTransaction({
        transaction,
        signature: new transactions.Signature({
            keyType: transaction.publicKey.keyType,
            data: signature.signature,
        }),
      });

    // Serialize signed transaction
    const signedSerializedTx = signedTransaction.encode();

    // sends transaction to NEAR blockchain via JSON RPC call and records the result
    const result = await near.connection.provider.sendJsonRpc("broadcast_tx_commit", [
        Buffer.from(signedSerializedTx).toString("base64"),
    ]);

    console.log(result);
}

main();
