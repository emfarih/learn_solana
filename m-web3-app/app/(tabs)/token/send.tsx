import React, { useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, TouchableOpacity } from "react-native";
import { useWallet } from "@solana/wallet-adapter-react";
import { styles } from "@/components/styles";
import { useTokens } from "@/components/token/token_provider";
import { Picker } from "@react-native-picker/picker";
import { Snackbar } from "react-native-paper";

const SendScreen = () => {
  const wallet = useWallet();
  const {sendToken, tokens, loading: tokensLoading } = useTokens();
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

  const handleSendToken = async () => {
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
      // Call the sendToken function from the token provider
      await sendToken(recipientAddress,amount,selectedToken);

      setSnackbarMessage(`Transaction successful!`);
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
            <TouchableOpacity style={styles.button} onPress={handleSendToken}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          )}

          <Snackbar style={styles.snackbar} visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={5000}>
            <Text style = {styles.snackbarText}>{snackbarMessage}</Text>
          </Snackbar>
        </>
      )}
    </View>
  );
};

export default SendScreen;
