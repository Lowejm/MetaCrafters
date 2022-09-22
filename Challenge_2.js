// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        146,  97, 201, 228,  68, 128, 235, 140,  66, 216, 143,
        208, 193, 152, 130, 245, 228, 140, 194,  49,  45,  37,
        233,  40, 117,  88, 183,  61, 172, 245, 240,  38,  14,
        206, 219, 132, 226,  37, 213,  17, 218,  81,  80, 245,
        112,  79, 223,  31, 115, 116, 123, 207,  29,  39,  54,
        248, 189, 222, 166, 155, 109, 179, 188,   9
      ]           
);

const getWalletBalance = async (pubKey) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        console.log("Connection object is:", connection);

        const walletBalance = await connection.getBalance(
            //1 more way to get a public key
            new PublicKey(pubKey)
        );
        console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        const balance = parseInt(walletBalance) / LAMPORTS_PER_SOL
        
        return balance
    } catch (err) {
        console.log(err);
    }
};


const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    
    //Get balance of from wallet
    await getWalletBalance(from.publicKey);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    //Get balance of to wallet
    await getWalletBalance(to.publicKey);
    

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    const fromBalance = await connection.getBalance(
        //1 more way to get a public key
        new PublicKey(from.publicKey)
    );
    console.log((parseInt(fromBalance) / LAMPORTS_PER_SOL)/2)
    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL * (parseInt(fromBalance) / LAMPORTS_PER_SOL)/2
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    //Pull final balances
    await getWalletBalance(from.publicKey);
    await getWalletBalance(to.publicKey);
}





transferSol();
