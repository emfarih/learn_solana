import { Connection, PublicKey, PublicKeyInitData, Transaction, clusterApiUrl } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react"; // Import the WalletContextState type

export const createTokenAccount = async (
  wallet: WalletContextState, // Accept wallet as an argument
  mintAddress: PublicKeyInitData
) => {
  if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
    console.log("Please connect your wallet.");
    return null; // Return null if the wallet is not connected
  }

  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletPublicKey = wallet.publicKey; // Public key of the wallet (owner)
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
      return null; // Account already exists, no need to create it
    }

    // Prepare the transaction to create the token account
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        walletPublicKey, // Payer (the wallet)
        associatedTokenAccountAddress, // The new associated token account
        walletPublicKey, // The owner of the token account
        mintPublicKey // The mint address (token)
      )
    );

    // Get recent blockhash for the transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = walletPublicKey;

    // Sign the transaction using the wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the signed transaction
    const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log("Transaction ID:", txId);
    return txId; // Return transaction ID for further processing
  } catch (error) {
    console.error("Error creating token account:", error);
    return null; // Return null in case of error
  }
};
