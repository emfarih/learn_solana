import React, { useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useWallet } from "@solana/wallet-adapter-react";
import { styles } from "@/components/styles";
import { truncateAddress } from "@/components/token/utils";
import { Token, useTokens } from "@/components/token/token_provider";

const ListTokenScreen = () => {
  const wallet = useWallet();
  const { tokens, loading } = useTokens(); // Get tokens and loading state from the context

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
