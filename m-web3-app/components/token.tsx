import { PublicKey } from "@solana/web3.js";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

type Token = {
  mint: string;
  accountAddress: string;
  amount: number;
  decimals: number;
  name?: string;
  symbol?: string;
  uri?: string;
};

export default METADATA_PROGRAM_ID;
export type { Token };
