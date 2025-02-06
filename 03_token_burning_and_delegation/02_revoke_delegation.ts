import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount, revoke } from "@solana/spl-token";
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

try {
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        TOKEN_MINT_ADDRESS,
        user.publicKey,
    );
    
    const revokeTransactionSignature = await revoke(
        connection,
        user,
        userTokenAccount.address,
        user.publicKey,
    );

    const explorerLink = getExplorerLink(
        "transaction",
        revokeTransactionSignature,
        "devnet",
    );
    console.log(`✅ Revoke Delegate Transaction: ${explorerLink}`);

} catch (error) {
    console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
}