import React, { createContext, useContext, useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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
  ) => Promise<string>;
  sendToken: (recipient: string, amount: string, mint: string) => Promise<string>;
}

const TokenContext = createContext<TokenContextType>({
  tokens: [],
  loading: true,
  fetchTokens: () => {},
  createToken: async () => "",
  sendToken: async () => "",
});

const fetchMetadata = async (connection: Connection, mint: string) => {
  console.log(`[fetchMetadata] Start fetching metadata for mint: ${mint}`);
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

    console.log(`[fetchMetadata] Metadata PDA: ${metadataPDA.toBase58()}`);

    const accountInfo = await connection.getAccountInfo(metadataPDA);
    if (accountInfo) {
      console.log(`[fetchMetadata] Metadata account info found, data length: ${accountInfo.data.length}`);

      const metadata = accountInfo.data.toString("utf8");
      const parsedMetadata = JSON.parse(metadata.slice(metadata.indexOf("{")));
      console.log(`[fetchMetadata] Parsed metadata:`, parsedMetadata);

      return {
        name: parsedMetadata.data.name,
        symbol: parsedMetadata.data.symbol,
        uri: parsedMetadata.data.uri,
      };
    } else {
      console.log("[fetchMetadata] No metadata account info found.");
    }
  } catch (error) {
    console.warn(`[fetchMetadata] Failed to fetch metadata for mint ${mint}:`, error);
  }
  return {};
};

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    if (!wallet.publicKey) {
      console.log("[fetchTokens] Wallet public key is not available.");
      return;
    }

    console.log(`[fetchTokens] Fetching tokens for wallet: ${wallet.publicKey.toBase58()}`);
    setLoading(true);

    const connection = new Connection(clusterApiUrl("devnet"));
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      console.log(`[fetchTokens] Found ${tokenAccounts.value.length} token accounts.`);

      const tokenList: Token[] = [];

      for (const account of tokenAccounts.value) {
        const info = account.account.data.parsed.info;
        console.log(`[fetchTokens] Token account: ${account.pubkey.toBase58()}`);
        console.log(`[fetchTokens] Mint: ${info.mint}, Amount: ${info.tokenAmount.amount}, Decimals: ${info.tokenAmount.decimals}`);

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

      console.log("[fetchTokens] Tokens fetched and constructed:", tokenList);
      setTokens(tokenList);
    } catch (error) {
      console.error("[fetchTokens] Error fetching tokens:", error);
    } finally {
      setLoading(false);
      console.log("[fetchTokens] Loading set to false");
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
      const msg = "[createToken] Wallet is not connected or public key is null.";
      console.error(msg);
      throw new Error(msg);
    }

    setLoading(true);
    console.log("[createToken] Creating token with parameters:", { decimals, metadataName, metadataSymbol, metadataUri, amount });
    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      // Step 1: Create Mint Transaction
      const mint = Keypair.generate();
      console.log(`[createToken] Generated new mint account: ${mint.publicKey.toBase58()}`);

      const _createMintTransactionIxs = await createAndInitializeMintTransactionInstructions(
        connection,
        mint.publicKey,
        wallet.publicKey,
        decimals
      );
      console.log("[createToken] Mint initialization instructions created.");

      const mintAddress = mint.publicKey.toBase58();

      // Step 2: Create Metadata Transaction
      const _createMetadataTransactionIx = await createMetadataTransactionInstruction(
        mintAddress,
        metadataName,
        metadataSymbol,
        metadataUri,
        wallet.publicKey
      );
      console.log("[createToken] Metadata transaction instruction created.");

      // Step 3: Create Token Account Transaction
      const { instruction: _createATAtransactionInstruction, associatedTokenAccountAddress } = await createTokenAccountTransaction(
        connection,
        wallet.publicKey,
        mintAddress
      );
      console.log(`[createToken] Token account transaction created. ATA: ${associatedTokenAccountAddress?.toBase58()}`);

      if (!associatedTokenAccountAddress) {
        throw new Error("[createToken] Associated Token Account address is null.");
      }

      // Step 4: Mint Token
      const amountToMint = parseInt(amount);
      const _mintTokenIx = await mintTokenInstruction(
        mintAddress,
        wallet.publicKey,
        associatedTokenAccountAddress,
        amountToMint
      );
      console.log(`[createToken] Mint token instruction created for amount: ${amountToMint}`);

      // Combine transactions
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

      console.log("[createToken] All instructions added to transaction. Signing...");

      const signedTransaction = await wallet.signTransaction(combinedTransaction);
      signedTransaction.partialSign(mint);

      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log(`[createToken] Transaction sent. TxId: ${txId}`);

      await waitForConfirmation(connection, txId);

      console.log("[createToken] Transaction confirmed. Fetching tokens again.");
      await fetchTokens();

      return txId;
    } catch (error) {
      console.error("[createToken] Error creating token:", error);
      throw error;
    } finally {
      setLoading(false);
      console.log("[createToken] Loading set to false");
    }
  };

  const sendToken = async (
    recipientAddress: string,
    amount: string,
    selectedToken: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      const msg = "[sendToken] Wallet is not connected or public key is null.";
      console.error(msg);
      throw new Error(msg);
    }

    setLoading(true);
    console.log("[sendToken] Sending token with parameters:", { recipientAddress, amount, selectedToken });
    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      console.log("[sendToken] Connected to devnet.");

      const token = tokens.find((t) => t.mint === selectedToken);
      if (!token) {
        throw new Error(`[sendToken] Token with mint ${selectedToken} not found in tokens list.`);
      }

      const tokenAmount = Math.floor(parseFloat(amount) * Math.pow(10, token.decimals));
      console.log(`[sendToken] Amount to send (smallest unit): ${tokenAmount}`);

      const senderTokenAccount = await getAssociatedTokenAddress(new PublicKey(selectedToken), wallet.publicKey);
      console.log(`[sendToken] Sender's token account: ${senderTokenAccount.toBase58()}`);

      const recipientPubKey = new PublicKey(recipientAddress);
      let recipientTokenAccount = await getAssociatedTokenAddress(new PublicKey(selectedToken), recipientPubKey);
      console.log(`[sendToken] Recipient's token account: ${recipientTokenAccount.toBase58()}`);

      const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
      if (!recipientAccountInfo) {
        console.log("[sendToken] Recipient's associated token account does not exist. Creating it.");

        const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          recipientTokenAccount,
          recipientPubKey,
          new PublicKey(selectedToken)
        );

        const createTransaction = new Transaction().add(createAssociatedTokenAccountIx);
        const { blockhash: createBlockhash, lastValidBlockHeight: createLastValidBlockHeight } = await connection.getLatestBlockhash();
        createTransaction.recentBlockhash = createBlockhash;
        createTransaction.feePayer = wallet.publicKey;

        const signedCreateTransaction = await wallet.signTransaction(createTransaction);
        const createTxId = await connection.sendRawTransaction(signedCreateTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        console.log(`[sendToken] Associated token account created. TxID: ${createTxId}`);

        await waitForConfirmation(connection, createTxId);
      } else {
        console.log("[sendToken] Recipient's associated token account exists.");
      }

      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        wallet.publicKey,
        tokenAmount
      );
      console.log(`[sendToken] Transfer instruction created for amount: ${tokenAmount}`);

      const transferTransaction = new Transaction().add(transferInstruction);
      const { blockhash: transferBlockhash, lastValidBlockHeight: transferLastValidBlockHeight } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = transferBlockhash;
      transferTransaction.feePayer = wallet.publicKey;

      const signedTransferTransaction = await wallet.signTransaction(transferTransaction);
      const transferTxId = await connection.sendRawTransaction(signedTransferTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log(`[sendToken] Token transfer successful. TxID: ${transferTxId}`);

      await waitForConfirmation(connection, transferTxId);

      console.log("[sendToken] Transfer confirmed. Refreshing tokens list.");
      await fetchTokens();

      return transferTxId;
    } catch (error) {
      console.error("[sendToken] Error sending token:", error);
      throw error;
    } finally {
      setLoading(false);
      console.log("[sendToken] Loading set to false");
    }
  };

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && wallet.publicKey) {
      console.log("[useEffect] Wallet public key changed, fetching tokens.");
      fetchTokens();
    }
  }, [wallet.publicKey, hasMounted]);

  if (!hasMounted) return null;

  return (
    <TokenContext.Provider value={{ tokens, loading, fetchTokens, createToken, sendToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => useContext(TokenContext);
export type { Token };
