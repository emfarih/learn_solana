import React, { createContext, useContext, useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { METADATA_PROGRAM_ID, waitForConfirmation } from "../utils";
// import { WalletAdapterPlugin } from "./wallet_adapter_plugin";
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
// import { generateSigner, Umi } from "@metaplex-foundation/umi";
// import { createMintWithAssociatedToken, findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
// import { WalletAdapterPlugin } from "./wallet_adapter_plugin";

type Token = {
  mint: string;
  accountAddress: string;
  amount: number;
  decimals: number;
  name?: string;
  symbol?: string;
  uri?: string;
};

interface TokenContextType {
  tokens: Token[];
  loading: boolean;
  fetchTokens: () => void;
  createToken: (
    decimals: string,
    metadataName: string,
    metadataSymbol: string,
    metadataUri: string,
    amount: string
  ) => Promise<string>; // Return txId as string
  sendToken: (recipient: string, amount: string, mint: string) => Promise<string>; // Return txId as string
}

const TokenContext = createContext<TokenContextType>({
  tokens: [],
  loading: true,
  fetchTokens: () => {},
  createToken: async () => "", // Return a string (txId)
  sendToken: async () => "", // Return a string (txId)
});

const fetchMetadata = async (connection: Connection, mint: string) => {
  try {
    const metadataPDA = (
      await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          new PublicKey(mint).toBuffer(),
        ],
        METADATA_PROGRAM_ID
      )
    )[0];

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    if (accountInfo) {
      const metadata = accountInfo.data.toString("utf8");
      const parsedMetadata = JSON.parse(metadata.slice(metadata.indexOf("{")));
      return {
        name: parsedMetadata.data.name,
        symbol: parsedMetadata.data.symbol,
        uri: parsedMetadata.data.uri,
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch metadata for mint ${mint}:`, error);
  }
  return {};
};

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  // const [umi, setUmi] = useState<Umi | null>(null);

  const fetchTokens = async () => {
    console.log("Start Fetching...");
  
    setLoading(true);
  
    try {
      const umi = createUmi('https://api.devnet.solana.com')
 
      // const walletPlugin = new WalletAdapterPlugin(wallet);
      // const umi = createUmi()
      // console.log("Umi instance created:", umi);
      // newUmi.use(walletPlugin)
      // setUmi(newUmi);
      // console.log("Fetching tokens for wallet:", publicKey.toBase58());
  
      // // Fetch token accounts owned by the wallet
      // const tokenAccounts = await umi.rpc.getTokenAccountsByOwner(publicKey);
  
      // console.log("Fetched token accounts:", tokenAccounts);
  
      // const tokenList = await Promise.all(
      //   tokenAccounts.map(async (account) => {
      //     const mintAddress = account.mint;
      //     const associatedTokenAddress = getAssociatedTokenAddressSync(mintAddress, publicKey);
  
      //     const balance = Number(account.amount);
      //     const decimals = account.decimals || 0;
  
      //     // Fetch metadata for the token
      //     const metadata = await umi.rpc.getMetadata(mintAddress);
  
      //     return {
      //       mint: mintAddress.toString(),
      //       accountAddress: associatedTokenAddress.toString(),
      //       amount: balance / Math.pow(10, decimals),
      //       decimals,
      //       name: metadata?.name || "Unknown",
      //       symbol: metadata?.symbol || "UNKNOWN",
      //       uri: metadata?.uri || "",
      //     };
      //   })
      // );
      const tokenList :Token[] = [];
      console.log("Constructed token list:", tokenList);
      setTokens(tokenList);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (
    decimals: string,
    metadataName: string,
    metadataSymbol: string,
    metadataUri: string,
    amount: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet is not connected or public key is null.");
    }
  
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      // const newUmi = createUmi(connection);
      // const walletPlugin = new WalletAdapterPlugin(wallet);
      // newUmi.use(walletPlugin)
      // setUmi(newUmi);

      // ✅ Step 1: Generate a new token mint
      // const mint = generateSigner(newUmi);

      // ✅ Step 2: Define the recipient (wallet) and find its associated token account (ATA)
      // const recipient = newUmi.identity.publicKey;
      // const ata = findAssociatedTokenPda(newUmi, { mint: mint.publicKey, owner: recipient });

      // ✅ Step 3: Create the mint and send the transaction
      // const {signature}= await createMintWithAssociatedToken(newUmi, {
      //   mint,
      //   mintAuthority: newUmi.identity.publicKey,
      //   decimals: 9, // 9 is standard for SPL tokens
      //   amount: 1000000n, // Initial supply (adjust as needed)
      // }).sendAndConfirm(newUmi);
  
      // console.log("✅ Token Mint Address:", mint.publicKey.toString());
      // console.log("✅ Associated Token Account (ATA):", ata.toString());
      // console.log("✅ Transaction ID (txId):", signature.toString());
     
      // return signature.toString();
      return "";
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };  

  const sendToken = async (
    recipientAddress: string,
    amount: string,
    selectedToken: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet is not connected or public key is null.");
    }
  
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      console.log("Connection established to devnet.");
  
      // Convert amount to integer (use token's decimals for precision)
      const token = tokens.find((t) => t.mint === selectedToken);
      const tokenAmount = parseFloat(amount) * Math.pow(10, token?.decimals || 9);
      console.log(`Amount to send: ${tokenAmount} (in token's smallest unit)`);
      console.log("Selected token:", selectedToken);

      // Fetch associated token address for sender
      const senderTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        wallet.publicKey
      );
      console.log(`Sender's token account: ${senderTokenAccount.toBase58()}`);
  
      // Get recipient token account
      let recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        new PublicKey(recipientAddress)
      );
      console.log(`Recipient's token account: ${recipientTokenAccount.toBase58()}`);
  
      // Check if recipient token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
      if (!recipientAccountInfo) {
        console.log("Recipient's associated token account not found. Creating a new one.");
  
        // If not, create the associated token account for the recipient
        const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer (signer)
          recipientTokenAccount, // recipient's token account
          new PublicKey(recipientAddress), // recipient public key
          new PublicKey(selectedToken) // token mint address
        );
  
        // Create the transaction to create the associated token account
        const createTransaction = new Transaction().add(createAssociatedTokenAccountIx);
        const { blockhash: createBlockhash } = await connection.getLatestBlockhash();
        createTransaction.recentBlockhash = createBlockhash;
        createTransaction.feePayer = wallet.publicKey;
  
        // Sign and send the transaction to create the associated token account
        const signedCreateTransaction = await wallet.signTransaction(createTransaction);
        const txId = await connection.sendRawTransaction(signedCreateTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });
        await connection.confirmTransaction(txId); // Ensure it's confirmed before proceeding
        console.log(`Associated token account created! TxID: ${txId}`);
      } else {
        console.log("Recipient's associated token account already exists.");
      }
  
      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount, // Use the recipient's token account (created if needed)
        wallet.publicKey,
        tokenAmount
      );
      console.log(`Transfer instruction created for amount: ${tokenAmount}`);
  
      // Create the transfer transaction
      const transferTransaction = new Transaction().add(transferInstruction);
      const { blockhash: transferBlockhash } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = transferBlockhash;
      transferTransaction.feePayer = wallet.publicKey;
  
      // Sign and send the transfer transaction
      const signedTransferTransaction = await wallet.signTransaction(transferTransaction);
      const transferTxId = await connection.sendRawTransaction(signedTransferTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
  
      console.log(`Token transfer successful! TxID: ${transferTxId}`);
      // Wait for the transaction to be confirmed
      await waitForConfirmation(connection, transferTxId);  // Wait for confirmation
  
      // Fetch tokens again after confirmation
      await fetchTokens();

      return transferTxId; // Return the transaction ID
  
    } catch (error) {
      console.error("Error sending token:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (wallet.publicKey) {
      fetchTokens();
    }
  }, [wallet.publicKey]);

  return (
    <TokenContext.Provider value={{ tokens, loading, fetchTokens, createToken, sendToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => useContext(TokenContext);
export type { Token };
