import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, Connection, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { styles } from "@/components/styles";
import { useTokens } from "@/components/token/token_provider";
import { Picker } from "@react-native-picker/picker";

const SendScreen = () => {
  const wallet = useWallet();
  const { tokens, loading: tokensLoading } = useTokens();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Automatically select the first token
  React.useEffect(() => {
    if (tokens.length > 0) {
      setSelectedToken(tokens[0].mint); // Default to the first token in the list
    }
  }, [tokens]);

  const sendToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setSnackbarMessage("Wallet is not connected.");
      setSnackbarVisible(true);
      return;
    }

    if (!recipientAddress || !amount || !selectedToken) {
      setSnackbarMessage("Please provide recipient address, amount, and select a token.");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      // Convert amount to integer (use token's decimals for precision)
      const token = tokens.find((t) => t.mint === selectedToken);
      const tokenAmount = parseFloat(amount) * Math.pow(10, token?.decimals || 9);

      // Fetch associated token addresses
      const senderTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        wallet.publicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(selectedToken),
        new PublicKey(recipientAddress)
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        wallet.publicKey,
        tokenAmount
      );

      // Create the transaction
      const transaction = new Transaction().add(transferInstruction);

      // Add recent blockhash to the transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      setSnackbarMessage(`Transaction successful! TxID: ${txId}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error sending token:", error);
      setSnackbarMessage(`Error: ${error}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Token</Text>

      {!wallet.connected ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Please connect your wallet to proceed.</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Recipient Address"
            value={recipientAddress}
            onChangeText={setRecipientAddress}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Picker
            selectedValue={selectedToken}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedToken(itemValue)}
          >
            {tokens.map((token) => (
              <Picker.Item key={token.mint} label={token.symbol || token.mint} value={token.mint} />
            ))}
          </Picker>

          {loading || tokensLoading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={sendToken}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          )}

          {snackbarVisible && (
            <View style={styles.snackbar}>
              <Text>{snackbarMessage}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default SendScreen;
