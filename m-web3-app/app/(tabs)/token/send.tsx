import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { useWallet } from "@solana/wallet-adapter-react";
import { styles } from "@/components/styles";
import { useTokens } from "@/components/token/token_provider";
import { Picker } from "@react-native-picker/picker";
import { Snackbar } from "react-native-paper";

const SendScreen = () => {
  const wallet = useWallet();
  const { sendToken, tokens, loading: tokensLoading } = useTokens();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (tokens.length > 0) {
      setSelectedToken(tokens[0].mint);
      console.log("Default token selected:", tokens[0].mint);
    }
  }, [tokens]);

  const handleSendToken = async () => {
    console.log("Send button pressed");
    if (!wallet.publicKey || !wallet.signTransaction) {
      console.warn("Wallet is not connected");
      setSnackbarMessage("Wallet is not connected.");
      setSnackbarVisible(true);
      return;
    }

    if (!recipientAddress || !amount || !selectedToken) {
      console.warn("Missing input fields");
      setSnackbarMessage("Please provide recipient address, amount, and select a token.");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    console.log(`Sending token: ${selectedToken}, amount: ${amount}, to: ${recipientAddress}`);

    try {
      await sendToken(recipientAddress, amount, selectedToken);
      console.log("Transaction successful");
      setSnackbarMessage(`Transaction successful!`);
      setSnackbarVisible(true);
      setRecipientAddress("");
      setAmount("");
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
            <TouchableOpacity style={styles.button} onPress={handleSendToken}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          )}

          <Snackbar
            style={styles.snackbar}
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={5000}
          >
            <Text style={styles.snackbarText}>{snackbarMessage}</Text>
          </Snackbar>
        </>
      )}
    </View>
  );
};

export default SendScreen;
