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
    name, 
    symbol, 
    uri, 
    sellerFeeBasisPoints: 500,  // Royalty in basis points (5%)
    creators: null,
    uses: null,
    collection: null,
  };

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

  return metadataInstruction;
};

export { createMetadataTransactionInstruction };
