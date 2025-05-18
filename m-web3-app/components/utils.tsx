import { Connection, PublicKey } from "@solana/web3.js";

// Shorten long addresses for UI display: first 4 and last 4 chars separated by "..."
export const truncateAddress = (address: string | any[]) => {
  if (!address) return "";
  const strAddress = typeof address === "string" ? address : address.toString();
  return `${strAddress.slice(0, 4)}...${strAddress.slice(-4)}`;
};

// Constant for the Metaplex Metadata Program ID (for token metadata on Solana)
export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Wait for a transaction to be confirmed on-chain by polling every 2 seconds
export const waitForConfirmation = async (
  connection: Connection,
  transactionSignature: string
) => {
  let confirmed = false;

  while (!confirmed) {
    try {
      const status = await connection.getTransaction(transactionSignature);
      if (status?.meta?.err === null) {
        confirmed = true;
        console.log("Transaction confirmed:", transactionSignature);
      } else {
        console.log("Transaction failed or still pending, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Retry every 2 seconds
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Retry on error
    }
  }
};
