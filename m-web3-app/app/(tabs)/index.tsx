import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";

// export default function HomeScreen() {
//   useEffect(() => {
//     console.log('[HomeScreen] mounted');
//   }, []);

//   return (
//     <View>
//       <Text>Hello from HomeScreen!</Text>
//     </View>
//   );
// }


const HomeScreen = () => {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  console.log("[HomeScreen] Render - wallet.connected:", wallet.connected);

  useEffect(() => {
    console.log("[HomeScreen] mounted");

    return () => {
      console.log("[HomeScreen] unmounted");
    };
  }, []);

  useEffect(() => {
    console.log(`[HomeScreen] Wallet connection status changed: connected = ${wallet.connected}`);
    console.log(`[HomeScreen] Public key: ${wallet.publicKey ? wallet.publicKey.toBase58() : "null"}`);

    const fetchBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          console.log(`[HomeScreen] Fetching balance for publicKey: ${wallet.publicKey.toBase58()}`);
          const connection = new Connection(clusterApiUrl("devnet"));
          const balanceInLamports = await connection.getBalance(wallet.publicKey);
          const balanceInSol = balanceInLamports / 1e9;
          console.log(`[HomeScreen] Balance fetched: ${balanceInSol.toFixed(2)} SOL`);
          setBalance(balanceInSol);
        } catch (error) {
          console.error("[HomeScreen] Error fetching balance:", error);
          setBalance(null);
        }
      } else {
        console.log("[HomeScreen] Wallet not connected or publicKey unavailable, resetting balance");
        setBalance(null);
      }
    };

    fetchBalance();
  }, [wallet]);

  // Extra effect to log balance changes
  useEffect(() => {
    console.log("[HomeScreen] balance state updated:", balance);
  }, [balance]);

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