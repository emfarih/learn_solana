import React, { createContext, useContext, useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { METADATA_PROGRAM_ID, waitForConfirmation } from "../utils";
import { createAndInitializeMintTransactionInstructions } from "@/components/token/create/create_and_init_mint_ix";
import { createMetadataTransactionInstruction } from "@/components/token/create/create_metadata_ix";
import { createTokenAccountTransaction } from "@/components/token/create/create_token_account_ix";
import { mintTokenInstruction } from "@/components/token/create/mint_token_ix";

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
  sendToken: (recipient: string, mint: string, amount: string) => Promise<string>; // Return txId as string
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

  const fetchTokens = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    const connection = new Connection(clusterApiUrl("devnet"));

    try {
      console.log("Fetching tokens for wallet:", wallet.publicKey.toBase58());

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      console.log("Fetched token accounts:", tokenAccounts);

      const tokenList: Token[] = [];

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        console.log("Token account info:", info);

        // Fetch metadata for the token
        const metadata = await fetchMetadata(connection, info.mint);

        tokenList.push({
          mint: info.mint,
          accountAddress: account.pubkey.toBase58(),
          amount: Number(info.tokenAmount.amount),
          decimals: info.tokenAmount.decimals,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
        });
      }

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
  
      // Step 1: Create Mint Transaction
      const mint = Keypair.generate(); // Generate a new mint account
      const _createMintTransactionIxs = await createAndInitializeMintTransactionInstructions(
        connection,
        mint.publicKey,
        wallet.publicKey,
        decimals
      );
  
      const mintAddress = mint.publicKey.toBase58();
  
      // Step 2: Create Metadata Transaction
      const _createMetadataTransactionIx = await createMetadataTransactionInstruction(
        mintAddress,
        metadataName,
        metadataSymbol,
        metadataUri,
        wallet.publicKey
      );
  
      // Step 3: Create Token Account Transaction
      const { instruction: _createATAtransactionInstruction, associatedTokenAccountAddress } = await createTokenAccountTransaction(
        connection,
        wallet.publicKey,
        mintAddress
      );
  
      // Step 4: Mint Token
      if (!associatedTokenAccountAddress) {
        throw new Error("ATA is null.");
      }
      const amountToMint = parseInt(amount); // Use the dynamic amount input
      const _mintTokenIx = await mintTokenInstruction(
        mintAddress,
        wallet.publicKey,
        associatedTokenAccountAddress,
        amountToMint
      );
  
      // Combine all transactions into one
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const combinedTransaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: wallet.publicKey,
      });
  
      if (_createMintTransactionIxs) {
        combinedTransaction.add(_createMintTransactionIxs[0]);
        combinedTransaction.add(_createMintTransactionIxs[1]);
      }
      if (_createMetadataTransactionIx) {
        combinedTransaction.add(_createMetadataTransactionIx);
      }
      if (_createATAtransactionInstruction) {
        combinedTransaction.add(_createATAtransactionInstruction);
      }
      if (_mintTokenIx) {
        combinedTransaction.add(_mintTokenIx);
      }
  
      // Sign all transactions with the wallet
      const signedTransaction = await wallet.signTransaction(combinedTransaction);
      signedTransaction.partialSign(mint);
  
      // Send the signed transaction
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
  
      console.log("Transaction ID:", txId);
  
      // Wait for the transaction to be confirmed
      await waitForConfirmation(connection, txId);  // Wait for confirmation
  
      // Fetch tokens again after confirmation
      await fetchTokens();
      return txId;
  
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

      // Convert amount to integer (use token's decimals for precision)
      const token = tokens.find((t) => t.mint === selectedToken);
      const tokenAmount = parseFloat(amount) * Math.pow(10, token?.decimals || 9);

      // Fetch associated token addresses
      const senderTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        wallet.publicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        new PublicKey(recipientAddress)
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        wallet.publicKey,
        tokenAmount
      );

      // Create the transaction
      const transaction = new Transaction().add(transferInstruction);

      // Add recent blockhash to the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log(`Transaction successful! TxID: ${txId}`);
      return txId; // Return the transaction ID

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
