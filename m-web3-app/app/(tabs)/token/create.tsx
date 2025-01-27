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
  PublicKey,
  Keypair,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

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
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setSnackbarMessage("Error: Please connect your wallet.");
      setSnackbarVisible(true);
      return;
    }

    if (!metadataName || !metadataSymbol || !metadataUri) {
      setSnackbarMessage("Error: Please provide metadata (Name, Symbol, URI).");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      // Generate a new Keypair for the mint account
      const mint = Keypair.generate();
      console.log("Mint address:", mint.publicKey.toBase58());
      // const mintAddress = "7cFKRrupJYM37pvR3aEtosto1MYDUh2PvTbKX5LJhunJ";

      // Calculate rent exemption for the mint account
      const rentExemption = await getMinimumBalanceForRentExemptMint(connection);

      // Create instructions to set up the mint
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: rentExemption,
        space: MINT_SIZE,
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });

      const initializeMintIx = createInitializeMintInstruction(
        mint.publicKey, // The mint's public key
        parseInt(decimals), // Number of decimals
        wallet.publicKey, // Mint authority
        wallet.publicKey // Freeze authority (optional)
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      // Create a transaction
      const transaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: wallet.publicKey,
      }).add(createMintAccountIx, initializeMintIx);

      // Partially sign the transaction with the mint Keypair
      transaction.partialSign(mint);

      // Let the wallet sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send the transaction to the blockchain
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // Confirm the transaction
      await connection.confirmTransaction(txId);

      const mintAddress = mint.publicKey.toBase58();
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
