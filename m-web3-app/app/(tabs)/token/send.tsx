import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Picker } from "@react-native-picker/picker";
import { styles } from "@/components/styles";

// Define the type of tokens as an array of objects with mintAddress and symbol
interface TokenInfo {
  mintAddress: string;
  symbol: string;
}

const SendScreen = () => {
  const wallet = useWallet();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]); // Explicitly define tokens as TokenInfo[]
  const [selectedToken, setSelectedToken] = useState(""); // Selected token
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!wallet.publicKey) return;
      const connection = new Connection(clusterApiUrl("devnet"));

      // Fetch token accounts from the wallet's public key
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenList: TokenInfo[] = tokenAccounts.value.map((account) => {
        const tokenMintAddress = account.account.data.parsed.info.mint;
        return {
          mintAddress: tokenMintAddress,
          symbol: tokenMintAddress.substring(0, 5), // Example: you can map the mint to a symbol
        };
      });

      setTokens(tokenList);
      if (tokenList.length > 0) setSelectedToken(tokenList[0].mintAddress);
    };

    fetchTokens();
  }, [wallet.publicKey]);

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
      const tokenAmount = parseFloat(amount) * Math.pow(10, 9);  // Assuming 9 decimals (common for USDC, USDT)

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
              <Picker.Item key={token.mintAddress} label={token.symbol} value={token.mintAddress} />
            ))}
          </Picker>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Button title="Send Token" onPress={sendToken} />
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
