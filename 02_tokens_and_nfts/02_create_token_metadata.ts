import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
require("dotenv").config();
import { Connection, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");
console.log("User address: ", user.publicKey.toBase58());

const connection = new Connection(clusterApiUrl("devnet"));

const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const TOKEN_MINT_ADDRESS = "9Pot4EZS1dDK73Gut3QuyncYzJ3dbZyNBW7xHPJSu13s";
const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);

const metadataData = {
    name: "MLIMITED",
    symbol: "M",
    // Arweave / IPFS / Pinata etc link using metaplex standard for offchain data
    uri: "https://arweave.net/1234",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

const metadataPDAAndBump = await PublicKey.findProgramAddressSync(
    [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        tokenMintAccount.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

const metadataPDA = metadataPDAAndBump[0];

const transaction = new Transaction();

const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataPDA,
        mint: tokenMintAccount,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
    },
    {
        createMetadataAccountArgsV3: {
            collectionDetails: null,
            isMutable: true,
            data: metadataData,
        }
    }
);

transaction.add(createMetadataAccountInstruction);

const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [user],
);

const transactionLink = getExplorerLink("tx", transactionSignature, "devnet");
console.log("Transaction link: ", transactionLink);

const tokenMintLink = getExplorerLink("address", tokenMintAccount.toString(), "devnet");
console.log("Token mint link: ", tokenMintLink);