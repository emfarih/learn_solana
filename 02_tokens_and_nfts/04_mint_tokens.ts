import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
require('dotenv').config();
import { getKeypairFromEnvironment, getExplorerLink } from '@solana-developers/helpers';
import { mintTo } from '@solana/spl-token';

const connection = new Connection(clusterApiUrl('devnet'));

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const userAccount = getKeypairFromEnvironment('SECRET_KEY');
console.log('User address: ', userAccount.publicKey.toBase58());

const TOKEN_MINT_ADDRESS = "9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s";
const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);

const TOKEN_ACCOUNT_ADDRESS = 'EMrLtV5LC8VDVpMJoRxaLE16P9ijrUvbhpqnFUrNkQkH';
const recipientTokenAccount = new PublicKey(TOKEN_ACCOUNT_ADDRESS);

const signature = await mintTo(
    connection,
    userAccount,
    tokenMintAccount,
    recipientTokenAccount,
    userAccount,
    10 * MINOR_UNITS_PER_MAJOR_UNITS
);
const transactionLink = getExplorerLink('tx', signature, 'devnet');
console.log('Transaction link: ', transactionLink);