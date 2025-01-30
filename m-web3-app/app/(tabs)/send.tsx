import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { Snackbar } from "react-native-paper";
import { styles } from "@/components/styles";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer; // Assign Buffer to the global object
}

const SendScreen = () => {
  const wallet = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSend = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      showSnackbar("Please connect your wallet first.");
      return;
    }

    if (!recipient || !amount) {
      showSnackbar("Please fill out all fields.");
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: Math.floor(parseFloat(amount) * 1e9), // Convert SOL to lamports
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      if (wallet.signTransaction) {
        const signedTransaction = await wallet.signTransaction(transaction);
        const txId = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(txId);

        showSnackbar(`Transaction successful! Tx ID: ${txId}`);
        setRecipient("");
        setAmount("");
      } else {
        showSnackbar("The connected wallet does not support signing transactions.");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      showSnackbar("Transaction failed. Please try again.");
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  return (
    <View style={styles.container}>
          <Text style={styles.title}>Send SOL</Text>
      {!wallet.connected ? (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Please connect your wallet to proceed.</Text>
              </View>
            ) : (
              <>
              <TextInput
        style={styles.input}
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (SOL)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
              </>)}
              
    </View>
  );
};

export default SendScreen;
