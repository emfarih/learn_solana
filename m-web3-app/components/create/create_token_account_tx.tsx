import { Connection, PublicKey, PublicKeyInitData } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

export const createTokenAccountTransaction = async (
  connection: Connection,
  walletPublicKey: PublicKey, // Accept wallet as an argument
  mintAddress: PublicKeyInitData
): Promise<{ instruction: any | null, associatedTokenAccountAddress: PublicKey | null }> => {
  try {
    const mintPublicKey = new PublicKey(mintAddress); // The mint address of the token

    // Derive the associated token account address synchronously
    const [associatedTokenAccountAddress] = PublicKey.findProgramAddressSync(
      [
        walletPublicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log("Associated Token Account Address:", associatedTokenAccountAddress.toBase58());

    // Check if the associated token account already exists
    const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAccountAddress);

    if (tokenAccountInfo) {
      console.log("Token account already exists!");
      return { instruction: null, associatedTokenAccountAddress: null }; // Account already exists, no need to create an instruction
    }

    // Create and return the associated token account instruction along with the ATA address
    const instruction = createAssociatedTokenAccountInstruction(
      walletPublicKey, // Payer (the wallet)
      associatedTokenAccountAddress, // The new associated token account
      walletPublicKey, // The owner of the token account
      mintPublicKey // The mint address (token)
    );

    return { instruction, associatedTokenAccountAddress }; // Return both the instruction and the associated token account address
  } catch (error) {
    console.error("Error creating token account instruction:", error);
    return { instruction: null, associatedTokenAccountAddress: null }; // Return nulls in case of error
  }
};
