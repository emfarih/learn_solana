import { createMintToInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, PublicKeyInitData } from "@solana/web3.js";

/**
 * Creates a mintTo instruction for minting SPL tokens to a destination token account.
 * @param mintAddress - The mint address of the token.
 * @param walletPublicKey - The wallet public key (mint authority).
 * @param destinationATA - The associated token account to receive minted tokens.
 * @param amount - The number of tokens to mint (in token units, not smallest units).
 * @param decimals - The number of decimals the token uses.
 * @returns TransactionInstruction to mint tokens.
 */
export const mintTokenInstruction = async (
  mintAddress: PublicKeyInitData,
  walletPublicKey: PublicKey,
  destinationATA: PublicKeyInitData,
  amount: number) => {
  const mintPublicKey = new PublicKey(mintAddress);
  const destinationATAPublicKey = new PublicKey(destinationATA);

  console.log(`[mintTokenInstruction] Minting ${amount} tokens (${amount * LAMPORTS_PER_SOL} in smallest units)`);
  console.log(`[mintTokenInstruction] Mint: ${mintPublicKey.toBase58()}`);
  console.log(`[mintTokenInstruction] Destination ATA: ${destinationATAPublicKey.toBase58()}`);
  console.log(`[mintTokenInstruction] Mint authority: ${walletPublicKey.toBase58()}`);

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
