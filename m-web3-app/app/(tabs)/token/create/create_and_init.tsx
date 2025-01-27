// mintUtils.js (Utility Functions)
import {
    Connection,
    SystemProgram,
    Keypair,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
  import {
    createInitializeMintInstruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
  } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
  
  /**
   * Creates and initializes a mint account.
   * @param {Connection} connection - The Solana connection object.
   * @param {Object} wallet - The wallet object (from useWallet).
   * @param {number} decimals - Number of decimals for the mint token.
   * @returns {Promise<{txId: string, mintAddress: string}>} Transaction ID and Mint Address.
   */
  export const createAndInitializeMint = async (connection: Connection, wallet: WalletContextState, decimals: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet is not connected or public key is null.");
    }
    const mint = Keypair.generate(); // Generate a new mint account
    const rentExemption = await getMinimumBalanceForRentExemptMint(connection);
  
    // Create and initialize mint instructions
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: rentExemption,
      space: MINT_SIZE,
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
  
    const initializeMintIx = createInitializeMintInstruction(
      mint.publicKey,
      parseInt(decimals),
      wallet.publicKey,
      wallet.publicKey
    );
  
    // Create transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const transaction = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: wallet.publicKey,
    }).add(createMintAccountIx, initializeMintIx);
  
    // Partially sign the transaction with the mint Keypair
    transaction.partialSign(mint);
  
    // Sign the transaction with the wallet
    const signedTransaction = await wallet.signTransaction(transaction);
  
    // Send the transaction and confirm it
    const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
  
    await connection.confirmTransaction(txId);
  
    return { txId, mintAddress: mint.publicKey.toBase58() };
  };
  