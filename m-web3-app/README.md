
# m-web3-app

A Solana Web3 app designed for easy interaction with Solana tokens using wallet connections, token transfers, and token management. 

## Features

1. **Wallet Connection**:
   - Connect your Solana wallet to the app (currently tested on the web).
   
2. **Send SOL**:
   - Allows you to send SOL to other addresses.

3. **Token Management**:
   - **List Tokens**: Displays available tokens in your wallet.
   - **Create Token**: Allows the creation of new Solana tokens (for testing purposes).
   - **Transfer Tokens**: Allows you to transfer tokens to a recipient.

## Setup Instructions

### Prerequisites

- Node.js (>= 16.0.0)
- Yarn or npm

### 1. Clone the repository

```bash
git clone https://github.com/emfarih/learn_solana.git
cd learn_solana/m-web3-app
```

### 2. Install dependencies

```bash
npm install
```

or if you're using Yarn:

```bash
yarn install
```

### 3. Run the app on Web (Tested)

```bash
npm run dev
```

or if you're using Yarn:

```bash
yarn dev
```

The app will open in your browser at [http://localhost:3000](http://localhost:3000).

### 4. Run the app on Mobile (Untested)

1. **For React Native**:  
   If you'd like to test it on mobile, you can run the app using React Native CLI or Expo.
   
   - Install Expo CLI (if you don’t have it yet):
     ```bash
     npm install -g expo-cli
     ```

   - Run the app on mobile:
     ```bash
     expo start
     ```

## Screens

### Tab Bar 1: Wallet Connection
- Use this screen to connect your wallet.

### Tab Bar 2: Send SOL
- Allows sending SOL from your connected wallet to any recipient address.

### Tab Bar 3: Token Management
- **List Tokens**: Displays all tokens associated with your wallet.
- **Create Token**: Allows the creation of new Solana tokens (currently for testing purposes).
- **Transfer Tokens**: Allows the transfer of Solana tokens to other addresses.
