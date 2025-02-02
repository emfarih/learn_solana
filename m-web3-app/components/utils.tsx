import { Connection, PublicKey } from "@solana/web3.js";

export const truncateAddress = (address: string | any[]) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const waitForConfirmation = async (connection: Connection, transactionSignature: string) => {
    let confirmed = false;
    while (!confirmed) {
      try {
        const status = await connection.getTransaction(transactionSignature);
        if (status?.meta?.err === null) {
          confirmed = true;
          console.log("Transaction confirmed:", transactionSignature);
        } else {
          console.log("Transaction failed or still pending, retrying...");
          await new Promise(resolve => setTimeout(resolve, 2000));  // Retry every 2 seconds
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        await new Promise(resolve => setTimeout(resolve, 2000));  // Retry on error
      }
    }
  };
