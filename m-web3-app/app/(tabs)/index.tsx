import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const HomeScreen = () => {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          const connection = new Connection(clusterApiUrl("devnet"));
          const balanceInLamports = await connection.getBalance(wallet.publicKey);
          const balanceInSol = balanceInLamports / 1e9;
          setBalance(balanceInSol);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [wallet]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Solana Wallet</Text>
      {wallet.connected && wallet.publicKey ? (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Connected Wallet:</Text>
          <WalletMultiButton />
          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>
              Balance: {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
            </Text>
          </View>
        </View>
      ) : (
        <WalletMultiButton />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#343a40",
  },
  card: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
  },
  account: {
    fontStyle: "italic",
    marginVertical: 10,
    textAlign: "center",
    color: "#6c757d",
    backgroundColor: "#e9ecef",
    padding: 8,
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },
  balanceContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#f1f3f5",
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  balance: {
    fontSize: 18,
    color: "#212529",
    fontWeight: "500",
  },
});

export default HomeScreen;
