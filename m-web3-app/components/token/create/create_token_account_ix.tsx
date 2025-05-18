import { Connection, PublicKey, PublicKeyInitData } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export const createTokenAccountTransaction = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  mintAddress: PublicKeyInitData
): Promise<{ instruction: any | null; associatedTokenAccountAddress: PublicKey | null }> => {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    console.log("[createTokenAccountTransaction] Mint PublicKey:", mintPublicKey.toBase58());
    console.log("[createTokenAccountTransaction] Wallet PublicKey:", walletPublicKey.toBase58());

    // Derive the ATA address
    const [associatedTokenAccountAddress] = PublicKey.findProgramAddressSync(
      [
        walletPublicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log("[createTokenAccountTransaction] Associated Token Account Address:", associatedTokenAccountAddress.toBase58());

    // Check if ATA exists
    const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAccountAddress);
    if (tokenAccountInfo) {
      console.log("[createTokenAccountTransaction] Token account already exists, no instruction needed.");
      return { instruction: null, associatedTokenAccountAddress: null };
    }

    // Create instruction to create ATA
    const instruction = createAssociatedTokenAccountInstruction(
      walletPublicKey,               // payer
      associatedTokenAccountAddress, // ATA address
      walletPublicKey,               // owner
      mintPublicKey                 // mint
    );

    console.log("[createTokenAccountTransaction] Created associated token account instruction.");
    return { instruction, associatedTokenAccountAddress };
  } catch (error) {
    console.error("[createTokenAccountTransaction] Error creating token account instruction:", error);
    return { instruction: null, associatedTokenAccountAddress: null };
  }
};
