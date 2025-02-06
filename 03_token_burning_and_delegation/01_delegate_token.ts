import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { approve, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
require('dotenv').config();

const connection = new Connection(clusterApiUrl("devnet"));
const user = getKeypairFromEnvironment("SECRET_KEY1");
const delegateUser = getKeypairFromEnvironment("SECRET_KEY2");

console.log(`🔑 Loaded keypair. User Public key: ${user.publicKey.toBase58()}`);
console.log(`🔑 Loaded keypair. Delegate Public key: ${delegateUser.publicKey.toBase58()}`);

const TOKEN_MINT_ADDRESS = new PublicKey("9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s");
const TOKEN_DECIMALS = 2;
const DELEGATE_AMOUNT = 50;
const MINOR_UNITS_PER_MAJOR_UNITS = 10 ** TOKEN_DECIMALS;

try{
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        TOKEN_MINT_ADDRESS,
        user.publicKey,
    );

    console.log("User Token Account:", userTokenAccount.address)

    // Approve the delegate
    const approveTransactionSignature = await approve(
        connection,
        user,
        userTokenAccount.address,
        delegateUser.publicKey,
        user.publicKey,
        DELEGATE_AMOUNT * MINOR_UNITS_PER_MAJOR_UNITS,
    );

    const explorerLink = getExplorerLink(
        "transaction",
        approveTransactionSignature,
        "devnet",
    );
    
    console.log(`✅ Delegate approved. Transaction: ${explorerLink}`);
}
catch(error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
}