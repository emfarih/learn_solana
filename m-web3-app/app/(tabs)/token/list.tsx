import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import METADATA_PROGRAM_ID, { Token } from "@/components/token";


const ListTokenScreen = () => {
  const wallet = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
          console.log("Raw metadata:", metadata);
          const parsedMetadata = JSON.parse(metadata.slice(metadata.indexOf("{")));
          console.log("parsedMetadata", parsedMetadata);
          console.log("parsedMetadata.data", parsedMetadata.data);
          console.log("parsedMetadata.data.name", parsedMetadata.data.name);
          console.log("parsedMetadata.data.symbol", parsedMetadata.data.symbol);
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

    const fetchTokens = async () => {
      if (!wallet.publicKey) return;

      setLoading(true);
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Fetch token accounts associated with the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const tokensList: Token[] = await Promise.all(
          tokenAccounts.value.map(async (accountInfo) => {
            const { mint, tokenAmount } = accountInfo.account.data.parsed.info;
            const metadata = await fetchMetadata(connection, mint);

            return {
              mint,
              amount: tokenAmount.uiAmount || 0,
              decimals: tokenAmount.decimals,
              ...metadata,
            };
          })
        );

        setTokens(tokensList);
      } catch (error) {
        console.error("Error fetching token accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (wallet.connected) {
      fetchTokens();
    }
  }, [wallet.publicKey, wallet.connected]);

  const renderItem = ({ item }: { item: Token }) => (
    <View style={styles.tokenContainer}>
      {item.name == null && item.symbol == null? (
        <Text style={styles.tokenText}>Mint Address: {item.mint}</Text>
      ) : (
        <>
          <Text style={styles.tokenText}>Name: {item.name}</Text>
          <Text style={styles.tokenText}>Symbol: {item.symbol}</Text>
        </>
      )}
      <Text style={styles.tokenText}>
        Balance: {item.amount.toFixed(item.decimals)}
      </Text>
      {item.uri && <Text style={styles.tokenText}>URI: {item.uri}</Text>}
    </View>
  );
  

  return (
    <View style={styles.container}>
      {!wallet.connected ? (
        <Text style={styles.notConnectedText}>Please connect your wallet to view tokens.</Text>
      ) : loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : tokens.length === 0 ? (
        <Text style={styles.noTokensText}>No tokens found for this wallet.</Text>
      ) : (
        <FlatList
          data={tokens}
          keyExtractor={(item) => item.mint}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  tokenContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  tokenText: {
    fontSize: 16,
    color: "#343a40",
  },
  noTokensText: {
    fontSize: 18,
    color: "#6c757d",
    textAlign: "center",
  },
  notConnectedText: {
    fontSize: 18,
    color: "#dc3545",
    textAlign: "center",
  },
});

export default ListTokenScreen;
