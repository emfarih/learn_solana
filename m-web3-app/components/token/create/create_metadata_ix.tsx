import { PublicKey, PublicKeyInitData } from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// Create Metadata Instructions
const createMetadataTransactionInstruction = async (
  mintAddress: PublicKeyInitData,
  name: any,
  symbol: any,
  uri: any,
  walletPublicKey: PublicKey
): Promise<any> => {
  console.log("[createMetadataTransactionInstruction] Starting creation of metadata instruction");
  console.log(`[createMetadataTransactionInstruction] Mint Address: ${mintAddress}`);
  console.log(`[createMetadataTransactionInstruction] Name: ${name}`);
  console.log(`[createMetadataTransactionInstruction] Symbol: ${symbol}`);
  console.log(`[createMetadataTransactionInstruction] URI: ${uri}`);
  console.log(`[createMetadataTransactionInstruction] Wallet PublicKey: ${walletPublicKey.toBase58()}`);

  const mintPublicKey = new PublicKey(mintAddress);

  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  
  // Find PDA for metadata
  const metadataPDA = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );

  console.log(`[createMetadataTransactionInstruction] Metadata PDA: ${metadataPDA[0].toBase58()}`);

  const metadataData = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 500, // 5%
    creators: null,
    uses: null,
    collection: null,
  };

  console.log("[createMetadataTransactionInstruction] Metadata data prepared:", metadataData);

  // Create metadata instruction
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

  console.log("[createMetadataTransactionInstruction] Metadata instruction created");

  return metadataInstruction;
};

export { createMetadataTransactionInstruction };
