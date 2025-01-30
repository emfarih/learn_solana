import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa", // Light background for better contrast
    width: "100%",  // Ensure this takes full width
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#343a40", // Dark color for title
    textAlign: "center", // Centered title
  },
  input: {
    width: "90%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da", // Soft border color
    fontSize: 16, // Consistent text size
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff", // Blue button background
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center", // Center button text
    elevation: 3, // Subtle shadow for button
  },
  buttonText: {
    color: "#ffffff", // White text for button
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContainer: {
    // paddingBottom: 20,
    // paddingHorizontal: 10, // Added padding for the sides
  },  
  infoContainer: {
    marginBottom: 20,
    alignItems: "center", // Centered info text
  },
  infoText: {
    fontSize: 16,
    color: "#007bff", // Blue color for info text
    marginBottom: 10,
    textAlign: "center", // Centered text
  },
  link: {
    color: "cyan", // Highlighted link color
    textDecorationLine: "underline",
  },
  loadingIndicator: {
    marginTop: 30,
  },
  noTokensText: {
    fontSize: 18,
    color: "#6c757d", // Gray color for no tokens text
    textAlign: "center", // Centered no tokens text
    marginTop: 20,
  },
  picker: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc", // Light border color for picker
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#ffffff", // White background for picker
  },
  snackbar: {
    backgroundColor: "#333", // Dark background for snackbar
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    alignItems: "center", // Center snackbar text
  },
  snackbarText: {
    color: "white", // White text for snackbar
    fontSize: 14,
  },
  tokenContainer: {
    padding: 15,
    marginVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    maxWidth: "100%",  // Ensures it doesn't overflow the screen
    width: "100%",     // Forces it to use the full available width
    overflow: "hidden", // Ensures content doesn't overflow
  },
  
  tokenText: {
    fontSize: 16,
    color: "#343a40", // Dark color for token text
    marginBottom: 5, // Space between lines
    flexWrap: "wrap",  // Allow text to wrap
    maxWidth: "100%",  // Prevent overflow beyond the screen width
  },
  tokenName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 5,
    flexWrap: "wrap",  // Allow text to wrap
    maxWidth: "100%",  // Prevent overflow beyond the screen width
  },
  tokenBalance: {
    fontSize: 16,
    color: "#28a745",
    marginBottom: 8,
    flexWrap: "wrap",  // Allow text to wrap if needed
    maxWidth: "100%",  // Prevent overflow
  },
  
  tokenSymbol: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 5,
  },
  tokenUri: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 5,
  },
  tokenAccount: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
    flexWrap: "wrap",  // Allow text to wrap
    maxWidth: "100%",  // Prevent overflow beyond the screen width
  },
  tokenValue: {
    fontSize: 16,
    color: "#343a40", // Dark color for token value text
    marginBottom: 10,
  },
  tokenDescription: {
    fontSize: 14,
    color: "#6c757d", // Lighter color for token description
    fontStyle: "italic", // Italicize description for better emphasis
  },
});