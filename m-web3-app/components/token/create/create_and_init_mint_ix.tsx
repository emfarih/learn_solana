import {
  Connection,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Creates and initializes a mint account.
 * @param {Connection} connection - The Solana connection object.
 * @param {PublicKey} mintPublicKey - The mint account public key.
 * @param {PublicKey} walletPublicKey - The wallet's public key.
 * @param {string} decimals - Number of decimals for the mint token.
 * @returns {Promise<TransactionInstruction[]>} Array of instructions for creating and initializing the mint account.
 */
export const createAndInitializeMintTransactionInstructions = async (
  connection: Connection,
  mintPublicKey: PublicKey,
  walletPublicKey: PublicKey,
  decimals: string
): Promise<TransactionInstruction[]> => {
  console.log("[createAndInitializeMintTransactionInstructions] Starting instruction creation");
  console.log(`[createAndInitializeMintTransactionInstructions] Mint PublicKey: ${mintPublicKey.toBase58()}`);
  console.log(`[createAndInitializeMintTransactionInstructions] Wallet PublicKey: ${walletPublicKey.toBase58()}`);
  console.log(`[createAndInitializeMintTransactionInstructions] Decimals (string): ${decimals}`);

  const rentExemption = await getMinimumBalanceForRentExemptMint(connection);
  console.log(`[createAndInitializeMintTransactionInstructions] Rent exemption lamports required: ${rentExemption}`);

  // Create mint account instruction
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: walletPublicKey,
    newAccountPubkey: mintPublicKey,
    lamports: rentExemption,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });
  console.log("[createAndInitializeMintTransactionInstructions] Created mint account instruction");

  // Initialize mint instruction
  const decimalsInt = parseInt(decimals);
  console.log(`[createAndInitializeMintTransactionInstructions] Parsed decimals: ${decimalsInt}`);

  const initializeMintIx = createInitializeMintInstruction(
    mintPublicKey,
    decimalsInt,
    walletPublicKey,
    walletPublicKey
  );
  console.log("[createAndInitializeMintTransactionInstructions] Created initialize mint instruction");

  // Return the instructions array
  console.log("[createAndInitializeMintTransactionInstructions] Returning instructions array");
  return [createMintAccountIx, initializeMintIx];
};
