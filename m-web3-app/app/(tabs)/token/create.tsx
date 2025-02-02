import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Snackbar } from "react-native-paper";
import { Connection, Keypair, Transaction, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createAndInitializeMintTransactionInstructions } from "@/components/token/create/create_and_init_mint_ix";
import { createMetadataTransactionInstruction } from "@/components/token/create/create_metadata_ix";
import { createTokenAccountTransaction } from "@/components/token/create/create_token_account_ix";
import { mintTokenInstruction } from "@/components/token/create/mint_token_ix";
import { styles } from "@/components/styles";
import { useTokens } from "@/components/token/token_provider";

const CreateScreen = () => {
  const wallet = useWallet();
  const { fetchTokens } = useTokens(); // Get the fetchTokens function from the context
  const [loading, setLoading] = useState(false);
  const [decimals, setDecimals] = useState("0");
  const [metadataName, setMetadataName] = useState("");
  const [metadataSymbol, setMetadataSymbol] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [amount, setAmount] = useState("1"); // New state for amount
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const createToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet is not connected or public key is null.");
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      // Step 1: Create Mint Transaction
      console.log("Creating mint transaction...");
      const mint = Keypair.generate(); // Generate a new mint account
      const _createMintTransactionIxs = await createAndInitializeMintTransactionInstructions(
        connection,
        mint.publicKey,
        wallet.publicKey,
        decimals
      );

      const mintAddress = mint.publicKey.toBase58(); // This is the actual mint address
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
      const {
        instruction: _createATAtransactionInstruction,
        associatedTokenAccountAddress,
      } = await createTokenAccountTransaction(connection, wallet.publicKey, mintAddress);
      console.log("Token account transaction created:", _createATAtransactionInstruction);

      // Step 4: Mint Token 
      if (!associatedTokenAccountAddress) {
        throw new Error("ATA is null.");
      }
      console.log("Minting token account transaction...");
      const amountToMint = parseInt(amount); // Use the dynamic amount input
      const _mintTokenIx = await mintTokenInstruction(
        mintAddress,
        wallet.publicKey,
        associatedTokenAccountAddress,
        amountToMint
      );
      console.log("Mint token instruction created:", _mintTokenIx);

      // Combine all transactions into one
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const combinedTransaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: wallet.publicKey,
      });

      // Add each transaction if not null
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
      if (_mintTokenIx) {
        combinedTransaction.add(_mintTokenIx);
        console.log("Added mint token instructions to the combined transaction.");
      }

      combinedTransaction.instructions.forEach((instruction, index) => {
        console.log(`Instruction ${index}:`, instruction.keys.map((key) => key.pubkey.toBase58()));
      });

      console.log("Combined transaction blockhash:", blockhash);

      // Sign all transactions with the wallet
      console.log("Signing the transaction with the wallet...");
      const signedTransaction = await wallet.signTransaction(combinedTransaction);
      signedTransaction.partialSign(mint);
      console.log("Transaction signed:", signedTransaction);

      // Send the signed transaction
      console.log("Sending transaction...");
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction ID:", txId);

      // Trigger the fetchTokens method after the token is created
      await fetchTokens();

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
      {!wallet.connected ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Please connect your wallet to proceed.</Text>
        </View>
      ) : (
        <>
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

          <TextInput
            style={styles.input}
            placeholder="Amount to Mint"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={createToken}>
              <Text style={styles.buttonText}>Create Token</Text>
            </TouchableOpacity>
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
        </>
      )}
    </View>
  );
};

export default CreateScreen;
