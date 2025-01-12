import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const suppliedPublicKey = process.argv[2];
const network = process.argv[3] || "devnet"; // Default to devnet if no network is provided

if (!suppliedPublicKey) {
  throw new Error("Provide a public key to check the balance of!");
}

// Determine the network URL
const networkUrl =
  network === "mainnet"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";

const connection = new Connection(networkUrl, "confirmed");

try {
  // Validate and create a PublicKey instance
  const publicKey = new PublicKey(suppliedPublicKey);

  // Fetch balance
  const balanceInLamports = await connection.getBalance(publicKey);
  const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

  console.log(
    `✅ Finished! The balance for the wallet at address ${publicKey} is:`
  );
  console.log(`   - ${balanceInLamports} lamports`);
  console.log(`   - ${balanceInSOL} SOL`);
  console.log(`Network: ${network}`);
} catch (error) {
  // Handle invalid wallet address
  console.error("❌ Error: Invalid wallet address provided.");
}