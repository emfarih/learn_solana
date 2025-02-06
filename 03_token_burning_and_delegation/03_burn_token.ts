import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { burn, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

require('dotenv').config();

const connection = new Connection(clusterApiUrl("devnet"));
const user = getKeypairFromEnvironment("SECRET_KEY1");
const delegateUser = getKeypairFromEnvironment("SECRET_KEY2");

console.log(`🔑 Loaded keypair. User Public key: ${user.publicKey.toBase58()}`);
console.log(`🔑 Loaded keypair. Delegate Public key: ${delegateUser.publicKey.toBase58()}`);

const TOKEN_MINT_ADDRESS = new PublicKey("9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s");
const TOKEN_DECIMALS = 2;
const BURN_AMOUNT = 5;

try {
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        TOKEN_MINT_ADDRESS,
        user.publicKey,
    );
    
    const burnAmount = BURN_AMOUNT * 10 ** TOKEN_DECIMALS;

    const transactionSignature = await burn(
        connection,
        user,
        userTokenAccount.address,
        TOKEN_MINT_ADDRESS,
        user,
        burnAmount,
      );

    const explorerLink = getExplorerLink(
        "transaction",
        transactionSignature,
        "devnet",
    );
    console.log(`✅ Burn Transaction: ${explorerLink}`);

} catch (error) {
    console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
}