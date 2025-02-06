import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Connection, clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(new Connection(clusterApiUrl("devnet")));

console.log("Umi instance created:", umi);
