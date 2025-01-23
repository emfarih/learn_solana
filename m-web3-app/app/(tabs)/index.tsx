import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Solana Wallet</Text>
      <WalletMultiButton/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  card: {
    padding: 20,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  account: {
    fontStyle: "italic",
    marginVertical: 10,
  },
  balanceContainer: {
    marginVertical: 20,
  },
  balance: {
    fontSize: 16,
  },
});

export default HomeScreen;
