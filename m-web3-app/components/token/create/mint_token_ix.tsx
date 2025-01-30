import { createMintToInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, PublicKeyInitData, Signer } from "@solana/web3.js";

export const mintTokenInstruction = async (mintAddress: PublicKeyInitData, walletPublicKey: PublicKey, destinationATA: PublicKeyInitData, amount: number) => {
    const mintPublicKey = new PublicKey(mintAddress);
    const destinationATAPublicKey = new PublicKey(destinationATA);
    const mintToIx = createMintToInstruction(
      mintPublicKey,
      destinationATAPublicKey,
      walletPublicKey,
      amount * LAMPORTS_PER_SOL,  // Amount in smallest units (e.g., lamports)
      [walletPublicKey],
      TOKEN_PROGRAM_ID
    );
  
    return mintToIx;
  };
  