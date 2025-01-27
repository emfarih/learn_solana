import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Snackbar } from "react-native-paper";
import {
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { addMetadataToMint } from "./create/add_metadata";
import { createAndInitializeMint } from "./create/create_and_init";

const CreateScreen = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [decimals, setDecimals] = useState("0");
  const [metadataName, setMetadataName] = useState("");
  const [metadataSymbol, setMetadataSymbol] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const createToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet is not connected or public key is null.");
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      // const { txId, mintAddress } = await createAndInitializeMint(connection, wallet, decimals);
      const mintAddress = '7cFKRrupJYM37pvR3aEtosto1MYDUh2PvTbKX5LJhunJ';
      const txId = await addMetadataToMint(
        mintAddress,
        metadataName,
        metadataSymbol,
        metadataUri,
        wallet.publicKey, // Pass wallet public key
        wallet.signTransaction // Pass wallet signTransaction function
      );

      setSnackbarMessage(
        `Success: Token created. Mint address: [${mintAddress}](https://explorer.solana.com/address/${mintAddress}?cluster=devnet). Transaction: [${txId}](https://explorer.solana.com/tx/${txId}?cluster=devnet)`
      );
      setSnackbarVisible(true);

      console.log("Transaction ID:", txId);
      console.log("Mint address:", mintAddress);
    } catch (error) {
      console.error("Error creating token:", error);
      setSnackbarMessage(`Error: Failed to create token: ${error}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Token</Text>

      <TextInput
        style={styles.input}
        placeholder="Decimals"
        keyboardType="numeric"
        value={decimals}
        onChangeText={setDecimals}
      />

      <TextInput
        style={styles.input}
        placeholder="Metadata Name"
        value={metadataName}
        onChangeText={setMetadataName}
      />

      <TextInput
        style={styles.input}
        placeholder="Metadata Symbol"
        value={metadataSymbol}
        onChangeText={setMetadataSymbol}
      />

      <TextInput
        style={styles.input}
        placeholder="Metadata URI"
        value={metadataUri}
        onChangeText={setMetadataUri}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title="Create Token" onPress={createToken} />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
      >
        <Text style={styles.snackbarText}>
          {snackbarMessage.split(/(\[.*?\]\(.*?\))/).map((part, index) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              return (
                <Text
                  key={index}
                  style={styles.link}
                  onPress={() => Linking.openURL(match[2])}
                >
                  {match[1]}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  snackbarText: {
    color: "white",
    fontSize: 14,
  },
  link: {
    color: "cyan",
    textDecorationLine: "underline",
  },
});

export default CreateScreen;
