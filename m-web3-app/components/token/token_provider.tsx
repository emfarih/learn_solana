// TokenProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { METADATA_PROGRAM_ID } from "./utils";

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
  fetchTokens: () => void; // Add a method to fetch tokens
}

const TokenContext = createContext<TokenContextType>({ tokens: [], loading: true, fetchTokens: () => {} });

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
          name: metadata.name,    // Token name from metadata
          symbol: metadata.symbol,  // Token symbol from metadata
          uri: metadata.uri,      // Token URI from metadata
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

  // Automatically fetch tokens when the wallet changes
  useEffect(() => {
    if (wallet.publicKey) {
      console.log("Wallet connected, fetching tokens...");
      fetchTokens();
    } else {
      console.log("Wallet not connected.");
    }
  }, [wallet.publicKey]);

  return (
    <TokenContext.Provider value={{ tokens, loading, fetchTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => useContext(TokenContext);
export type { Token };
