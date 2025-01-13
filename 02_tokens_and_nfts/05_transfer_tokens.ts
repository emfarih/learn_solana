import {getKeypairFromEnvironment,getExplorerLink } from '@solana-developers/helpers';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { transfer, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
require('dotenv').config();

const connection = new Connection(clusterApiUrl('devnet'));

const senderAccount = getKeypairFromEnvironment('SECRET_KEY');
console.log('Sender address: ', senderAccount.publicKey.toBase58());

const RECIPIENT_ADDRESS = "AbympD8AsDuYZCkzwCXQthHHKXSxmkH7cXX3CyNorndj";
const recipientAccount = new PublicKey(RECIPIENT_ADDRESS);
console.log('Recipient address: ', recipientAccount.toBase58());

const tokenMintAccount = new PublicKey("9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s");
console.log('Token mint address: ', tokenMintAccount.toBase58());

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log(`💸 Attempting to send 1 token to ${recipientAccount.toBase58()}...`);

const sourceATA = await getOrCreateAssociatedTokenAccount(
    connection,
    senderAccount,
    tokenMintAccount,
    senderAccount.publicKey
); 

const recipientATA = await getOrCreateAssociatedTokenAccount(
    connection,
    senderAccount,
    tokenMintAccount,
    recipientAccount
);

const signature = await transfer(
    connection,
    senderAccount,
    sourceATA.address,
    recipientATA.address,
    senderAccount,
    1 * MINOR_UNITS_PER_MAJOR_UNITS
);

const transactionLink = getExplorerLink('tx', signature, 'devnet');
console.log('Transaction link: ', transactionLink);