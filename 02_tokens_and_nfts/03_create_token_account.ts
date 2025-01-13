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

const RECIPIENT_ADDRESS_1 = "HQfwpjim6pehGPVqhcEoXYZhTW57bYTJJBdd2GDv5z63";
const RECIPIENT_ADDRESS_2 = "AbympD8AsDuYZCkzwCXQthHHKXSxmkH7cXX3CyNorndj";
const recipientAccount1 = userAccount.publicKey;
const recipientAccount2 = new PublicKey(RECIPIENT_ADDRESS_2);
console.log('Recipient address: ', recipientAccount2.toBase58());

const TOKEN_ACCOUNT_ADDRESS_1 = 'EMrLtV5LC8VDVpMJoRxaLE16P9ijrUvbhpqnFUrNkQkH';
const TOKEN_ACCOUNT_ADDRESS_2 = 'Hd8miqSnsyduzqyuZHaXA9i6WNaNpjQwMSh43F7LsUDi';
const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    userAccount,
    tokenMintAccount,
    recipientAccount2
);
console.log('Token account address: ', tokenAccount.address.toBase58());

const tokenAccountLink = getExplorerLink("address",tokenAccount.address.toBase58(), 'devnet');
console.log('Token account link: ', tokenAccountLink);