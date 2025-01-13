import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
require("dotenv").config();
import { getExplorerLink, getKeypairFromEnvironment } from '@solana-developers/helpers';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token' 

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const userAccount = getKeypairFromEnvironment('SECRET_KEY');
console.log('User address: ', userAccount.publicKey.toBase58());

const TOKEN_MINT_ADDRESS = "9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s";
const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);
console.log('Token mint address: ', tokenMintAccount.toBase58());

const recipientAccount = userAccount.publicKey;
console.log('Recipient address: ', recipientAccount.toBase58());

const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    userAccount,
    tokenMintAccount,
    recipientAccount
);
console.log('Token account address: ', tokenAccount.address.toBase58());

const tokenAccountLink = getExplorerLink("address",tokenAccount.address.toBase58(), 'devnet');
console.log('Token account link: ', tokenAccountLink);