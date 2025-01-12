import {Connection, clusterApiUrl} from '@solana/web3.js';
import {getExplorerLink, getKeypairFromEnvironment} from '@solana-developers/helpers'
import {createMint} from '@solana/spl-token';
require('dotenv').config();

const connection = new Connection(clusterApiUrl('devnet'));

const user = getKeypairFromEnvironment("SECRET_KEY");
console.log("User address: ", user.publicKey.toBase58());

const tokenMint = await createMint(
    connection,
    user,
    user.publicKey,
    null,
    2
);
console.log("Token mint address: ", tokenMint.toString());

const link = getExplorerLink('address', tokenMint.toString(), 'devnet');
console.log("Explorer link: ", link);