
# Learn Solana: m-web3-app

This repository contains the **m-web3-app** project, a web3 app built on the Solana blockchain. The app provides functionality to interact with Solana, send tokens, manage wallet connections, and perform transactions. The code is written in React Native and utilizes Solana's Web3.js and other related libraries.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Folder Structure](#folder-structure)
6. [How to Contribute](#how-to-contribute)
7. [License](#license)

## Project Overview

The **m-web3-app** provides a user interface to send and manage Solana-based tokens, interact with wallet addresses, and perform token transactions using the Solana blockchain. It uses the **Solana Web3.js** library for blockchain interactions, and **Solana SPL Token** library for token management. This project was built to learn about integrating Solana into a React Native application.

The app allows users to:
- Connect their Solana wallet.
- Send tokens to recipient addresses.
- View and manage the token balances.
- Handle token transfers with error handling and feedback.

## Technologies Used

- **React Native**: Framework for building native mobile applications using React.
- **Solana Web3.js**: Library for interacting with the Solana blockchain.
- **Solana SPL Token**: Token standard on the Solana blockchain for fungible tokens.
- **React Navigation**: Library for routing and navigation in React Native applications.
- **@react-native-picker/picker**: For the token selection dropdown.
- **ActivityIndicator**: For showing loading spinners during transaction processing.

## Installation

To run this project locally, follow the steps below:

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **React Native CLI**: Follow the official [React Native Setup](https://reactnative.dev/docs/environment-setup) to set up the development environment.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/emfarih/learn_solana.git
   cd learn_solana/m-web3-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the project:

   For iOS:
   ```bash
   npx react-native run-ios
   ```

   For Android:
   ```bash
   npx react-native run-android
   ```

4. Connect your Solana wallet and begin using the app.

## Usage

### Features

- **Connect Wallet**: The app provides an option to connect to a Solana wallet. Make sure to connect before trying to send any tokens.
- **Send Tokens**: You can input the recipient address, the amount of tokens to send, and select the token you want to send. It handles token transfers on the Solana blockchain.
- **Transaction Feedback**: After sending a transaction, the app provides feedback with success or error messages.

### Token Sending

The token sending functionality uses the following:
- Fetches the associated token address for the sender and recipient.
- Creates and signs a Solana transaction to transfer tokens from one account to another.
- Handles token precision (decimals) during the transfer process.
- Provides feedback on transaction status with a snackbar message.

## Folder Structure

Here’s a breakdown of the folder structure:

```
m-web3-app/
│
├── assets/                   # Assets for the app, such as images, icons, etc.
├── components/               # Reusable components (e.g., Button, Input fields, Snackbar)
│   ├── styles.js             # Global styles for the app
│   └── token_provider.tsx    # Logic for fetching and managing token data
├── node_modules/             # Installed npm packages
├── package.json              # Project dependencies and scripts
├── App.js                    # Entry point for the React Native app
└── README.md                 # Project documentation
```

- **components/token/token_provider.tsx**: Manages token functionality and interactions with Solana's blockchain.
- **App.js**: Main application logic and UI components.
- **assets/**: Contains any images or icons used in the app.

## How to Contribute

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push your changes (`git push origin feature/your-feature-name`).
5. Create a pull request describing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
