import {
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Connection, Transaction, clusterApiUrl, PublicKeyInitData } from "@solana/web3.js";

export const addMetadataToMint = async (
  mintAddress: PublicKeyInitData, 
  name: any, 
  symbol: any, 
  uri: any, 
  walletPublicKey: PublicKey, 
  signTransaction: Function
) => {
  if (!walletPublicKey || !signTransaction) {
    console.log("Please connect your wallet.");
    return null; // Return null if the wallet is not connected
  }

  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintPublicKey = new PublicKey(mintAddress);

    // Define metadata parameters
    const metadataPDA = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const metadataData = {
      name, // Name of the token (passed as argument)
      symbol, // Symbol for the token (passed as argument)
      uri, // URI to the JSON metadata file (passed as argument)
      sellerFeeBasisPoints: 500, // Royalty in basis points (5%)
      creators: null,
      uses: null, // For tokens with "use" cases like tickets
      collection: null,
    };

    // Create instruction to add metadata
    const metadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA[0],
        mint: mintPublicKey,
        mintAuthority: walletPublicKey,
        payer: walletPublicKey,
        updateAuthority: walletPublicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: metadataData,
          isMutable: true,
          collectionDetails: null,
        },
      }
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

    // Build transaction
    const transaction = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: walletPublicKey,
    }).add(metadataInstruction);

    // Sign transaction
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    console.log("Transaction ID:", txId);
    console.log("Metadata added to token mint successfully.");

    // Return the transaction ID
    return txId;
  } catch (error) {
    console.error("Error adding metadata:", error);
    return null; // Return null in case of error
  }
};
