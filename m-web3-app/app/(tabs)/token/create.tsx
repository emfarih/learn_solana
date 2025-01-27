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
  Keypair,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createMetadataTransactionInstruction } from "../../../components/create/create_metadata_tx";
import { createTokenAccountInstruction } from "../../../components/create/create_token_account_tx";
import { createAndInitializeMintTransactionInstructions } from "@/components/create/create_and_init_mint_tx";

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

      // Step 1: Create Mint Transaction (this will return a transaction object)
      console.log("Creating mint transaction...");
      const mint = Keypair.generate(); // Generate a new mint account
      const _createMintTransactionIxs = await createAndInitializeMintTransactionInstructions(connection, mint.publicKey, wallet.publicKey, decimals);

      const mintAddress = mint.publicKey.toBase58(); // This is the actual mint address
      // const mintAddress = "HoTsDYtP4iMcqCqyapGFLuF7PveFh47Ng8FpqU5CFE5Z";
      console.log("Mint Address:", mintAddress);

      // Step 2: Create Metadata Transaction
      console.log("Creating metadata transaction...");
      const _createMetadataTransactionIx = await createMetadataTransactionInstruction(
        mintAddress,
        metadataName,
        metadataSymbol,
        metadataUri,
        wallet.publicKey
      );
      console.log("Metadata transaction created:", _createMetadataTransactionIx);

      // Step 3: Create Token Account Transaction
      console.log("Creating token account transaction...");
      const _createATAtransactionInstruction = await createTokenAccountInstruction(connection, wallet.publicKey, mintAddress);
      console.log("Token account transaction created:", _createATAtransactionInstruction);

      // Combine all transactions into one
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const combinedTransaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: wallet.publicKey,
      });

      // Add each transaction only if it's not null
      if (_createMintTransactionIxs) {
        combinedTransaction.add(_createMintTransactionIxs[0]);
        combinedTransaction.add(_createMintTransactionIxs[1]);
        console.log("Added mint transaction to the combined transaction.");
      }
      
      if (_createMetadataTransactionIx) {
        combinedTransaction.add(_createMetadataTransactionIx);
        console.log("Added metadata instructions to the combined transaction.");
      }
      if (_createATAtransactionInstruction) {
        combinedTransaction.add(_createATAtransactionInstruction);
        console.log("Added token account instructions to the combined transaction.");
      }
      combinedTransaction.instructions.forEach((instruction, index) => {
        console.log(`Instruction ${index}:`, instruction.keys.map(key => key.pubkey.toBase58()));
      });

      console.log("Combined transaction blockhash:", blockhash);
      

      // Sign all transactions with the wallet
      console.log("Signing the transaction with the wallet...");
      const signedTransaction = await wallet.signTransaction(combinedTransaction);
      await signedTransaction.partialSign(mint)
      console.log("Transaction signed:", signedTransaction);

      // Send the signed transaction
      console.log("Sending transaction...");
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction ID:", txId);

      setSnackbarMessage(
        `Success: Token created. Mint address: [${mintAddress}](https://explorer.solana.com/address/${mintAddress}?cluster=devnet). Transaction: [${txId}](https://explorer.solana.com/tx/${txId}?cluster=devnet)`
      );
      setSnackbarVisible(true);

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
