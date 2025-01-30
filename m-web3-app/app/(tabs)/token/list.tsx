import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import METADATA_PROGRAM_ID, { Token } from "@/components/token";
import { styles } from "@/components/styles";
import { truncateAddress } from "@/components/token/utils";

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
              accountAddress: accountInfo.pubkey.toString(),
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
      {item.name == null && item.symbol == null ? (
        <Text style={styles.tokenText}>Mint Address: {truncateAddress(item.mint)}</Text>
      ) : (
        <>
          <Text style={styles.tokenName}>{item.name}</Text>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
        </>
      )}
      <Text style={styles.tokenBalance}>
        Balance: {item.amount.toFixed(item.decimals)}
      </Text>
      {item.uri && <Text style={styles.tokenUri}>URI: {item.uri}</Text>}
      <Text style={styles.tokenAccount}>
        Account Address: {truncateAddress(item.accountAddress)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token List</Text>

      {!wallet.connected ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Please connect your wallet to proceed.</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : tokens.length === 0 ? (
        <Text style={styles.noTokensText}>No tokens found for this wallet.</Text>
      ) : (
        <FlatList
          data={tokens}
          keyExtractor={(item) => item.mint}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContainer}
          style={{ width: '100%' }} // Ensures FlatList itself takes full width
        />
      )}
    </View>
  );
};

export default ListTokenScreen;
