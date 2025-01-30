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
 * @param {Object} walletPublicKey - The wallet object (from useWallet).
 * @param {number} decimals - Number of decimals for the mint token.
 * @returns {Promise<TransactionInstruction[]>} Array of instructions for creating and initializing the mint account.
 */
export const createAndInitializeMintTransactionInstructions = async (
  connection: Connection,
  mintPublicKey : PublicKey,
  walletPublicKey: PublicKey,
  decimals: string
): Promise<TransactionInstruction[]> => {
  const rentExemption = await getMinimumBalanceForRentExemptMint(connection);

  // Create mint account instruction
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: walletPublicKey,
    newAccountPubkey: mintPublicKey,
    lamports: rentExemption,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize mint instruction
  const initializeMintIx = createInitializeMintInstruction(
    mintPublicKey,
    parseInt(decimals),
    walletPublicKey,
    walletPublicKey
  );

  // Return the instructions array
  return [createMintAccountIx, initializeMintIx];
};
