// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
// import { Snackbar } from "react-native-paper";
// import { useTokens } from "@/components/token/token_provider";
// import { styles } from "@/components/styles";

// const CreateScreen = () => {
//   const { createToken, loading } = useTokens(); // Access createToken from context
//   const [decimals, setDecimals] = useState("0");
//   const [metadataName, setMetadataName] = useState("");
//   const [metadataSymbol, setMetadataSymbol] = useState("");
//   const [metadataUri, setMetadataUri] = useState("");
//   const [amount, setAmount] = useState("1");
//   const [snackbarVisible, setSnackbarVisible] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");

//   const handleCreateToken = async () => {
//     try {
//       // await createToken(decimals, metadataName, metadataSymbol, metadataUri, amount);
//       setSnackbarMessage("Token created successfully!");
//       setSnackbarVisible(true);
//     } catch (error) {
//       setSnackbarMessage(`Error: ${error}`);
//       setSnackbarVisible(true);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Token</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Decimals"
//         value={decimals}
//         onChangeText={setDecimals}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Metadata Name"
//         value={metadataName}
//         onChangeText={setMetadataName}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Metadata Symbol"
//         value={metadataSymbol}
//         onChangeText={setMetadataSymbol}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Metadata URI"
//         value={metadataUri}
//         onChangeText={setMetadataUri}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Amount to Mint"
//         value={amount}
//         onChangeText={setAmount}
//       />
//       {loading ? (
//         <ActivityIndicator size="large" color="#007bff" />
//       ) : (
//         <TouchableOpacity style={styles.button} onPress={handleCreateToken}>
//           <Text style={styles.buttonText}>Create Token</Text>
//         </TouchableOpacity>
//       )}
//       <Snackbar style={styles.snackbar} visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={5000}>
//         <Text style = {styles.snackbarText}>{snackbarMessage}</Text>
//       </Snackbar>
//     </View>
//   );
// };

// export default CreateScreen;
