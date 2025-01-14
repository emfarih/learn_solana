import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';

import 'package:flutter/material.dart';
import 'package:solana_wallet_adapter/solana_wallet_adapter.dart';
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';
import 'package:http/http.dart' as http;
import 'package:token_and_nft/model/token_account_response.dart';

class WalletProvider with ChangeNotifier {
  Pubkey? wallet;
  double balance = 0.0;
  bool isConnected = false;
  late SolanaWalletAdapter adapter; // Use late initialization
  static final Cluster cluster = Cluster.devnet;

  final Connection connection = Connection(Cluster.devnet);

  // Initialize the wallet adapter
  Future<void> initWalletAdapter() async {
    adapter = SolanaWalletAdapter(AppIdentity(), cluster: cluster);
    print('Adapter initialized: $adapter'); // Log initialization for debugging
    notifyListeners();
  }

  // Connect to the wallet
  Future<void> connectToWallet() async {
    try {
      print('Adapter initialized: $adapter'); // Log the adapter for debugging

      if (adapter.store.apps.isEmpty || adapter.store.apps.length < 2) {
        throw Exception("The apps list is empty or has fewer than two items.");
      }

      print('Adapter Store Apps: ${adapter.store.apps}'); // Log the apps

      if (!adapter.isAuthorized) {
        print('Authorizing wallet...');
        await adapter.authorize(
          walletUriBase: adapter.store.apps[1].walletUriBase,
        );
        print('Authorization successful!');

        if (adapter.connectedAccount != null) {
          final pubKey =
              Pubkey.tryFromBase64(adapter.connectedAccount!.address);
          print('Connected wallet address: $pubKey');
          isConnected = true;
          wallet = pubKey;
          updateBalance();
          notifyListeners();
        } else {
          print('No connected account found');
        }
      } else {
        print('Already authorized');
      }
    } catch (e) {
      print('Error in connectToWallet: $e');
    }
  }

  // Disconnect the wallet
  Future<void> disconnectWallet() async {
    print('Disconnecting from wallet...');
    await adapter.deauthorize();
    wallet = null;
    balance = 0.0;
    isConnected = false;
    notifyListeners();
  }

  // Update the balance
  Future<void> updateBalance() async {
    if (wallet == null) return;
    try {
      final lamports = await connection.getBalance(wallet!);
      balance = lamports / lamportsPerSol;
      notifyListeners();
    } catch (e) {
      print('Error fetching balance: $e');
    }
  }

  // Send SOL to another address
  Future<List<TransactionSignature?>?> sendSol(
      String recipient, double amount) async {
    final Connection connection = Connection(cluster);

    try {
      BigInt lamports = BigInt.from(amount * lamportsPerSol);
      print('Amount converted to lamports: $lamports');

      // Check for sufficient balance
      if (balance < (lamports.toDouble() / lamportsPerSol)) {
        throw Exception("Insufficient balance.");
      }

      // Create the transaction instruction with BigInt lamports
      final TransactionInstruction instruction = SystemProgram.transfer(
        fromPubkey: wallet!,
        toPubkey: Pubkey.fromBase58(recipient),
        lamports: lamports,
      );

      // Get the latest blockhash
      final latestBlockhash = await connection.getLatestBlockhash();
      print('Latest blockhash: ${latestBlockhash.blockhash}');

      // Create the transaction
      final Transaction transaction = Transaction.v0(
        payer: wallet!,
        instructions: [instruction],
        recentBlockhash: latestBlockhash.blockhash,
      );
      print('Transaction created: $transaction');

      // Encode the transaction
      final encodedTransaction = adapter.encodeTransaction(transaction);
      print('Encoded transaction: $encodedTransaction');

      // Sign the transaction
      final signedTransaction =
          await adapter.signTransactions([encodedTransaction]);
      print('Signed transaction: $signedTransaction');

      // Send the signed transaction and get the signature
      final signature = await connection
          .sendSignedTransactions(signedTransaction.signedPayloads);
      print('Signature: $signature');

      // Update the balance after the transaction
      await updateBalance();

      // Return the transaction signature on success
      return signature;
    } catch (e) {
      print('Transaction failed: $e');
      return null; // Return null if the transaction failed
    }
  }

  /// Fetch SPL token accounts for the current wallet
  Future<TokenAccountResponse> getTokenAccounts() async {
    if (wallet == null) {
      throw Exception('Wallet address is not set');
    }

    print('Fetching token accounts for wallet: ${wallet!.toBase58()}');

    final uri = adapter.cluster!.uri;
    final headers = {'Content-Type': 'application/json'};
    final body = jsonEncode({
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getTokenAccountsByOwner",
      "params": [
        wallet!.toBase58(),
        {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
        {"encoding": "jsonParsed"}
      ]
    });

    print('Request URI: $uri');
    print('Request Body: $body');

    try {
      final response = await http.post(uri, headers: headers, body: body);
      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Parsed JSON Response: $data');

        final tokenAccounts = TokenAccountResponse.fromJson(data);
        print(
            'Number of Token Accounts Found: ${tokenAccounts.accounts.length}');

        // Fetch metadata for each token mint
        for (var account in tokenAccounts.accounts) {
          print('Fetching metadata for Mint: ${account.accountInfo.mint}');
          final metadata = await fetchTokenMetadata(account.accountInfo.mint);
          account.metadata = metadata;
          print(
              'Metadata for Mint ${account.accountInfo.mint}: ${metadata != null ? metadata.name : 'No Metadata Found'}');
        }

        return tokenAccounts;
      } else {
        print('Error Response Body: ${response.body}');
        throw Exception('Error fetching token accounts: ${response.body}');
      }
    } catch (e) {
      print('Failed to fetch token accounts: $e');
      throw Exception('Failed to fetch token accounts: $e');
    }
  }

  Future<TokenMetadata?> fetchTokenMetadata(String mintAddress) async {
    final metadataProgramId =
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"; // Metaplex Token Metadata Program ID
    final metadataAccount = await getMetadataAccount(mintAddress);

    print('Fetching metadata for Mint Address: $mintAddress');
    print('Derived Metadata Account: $metadataAccount');

    final uri = adapter.cluster!.uri;
    final headers = {'Content-Type': 'application/json'};
    final body = jsonEncode({
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getAccountInfo",
      "params": [
        metadataAccount,
        {"encoding": "jsonParsed"}
      ]
    });

    print('Request URI: $uri');
    print('Request Body: $body');

    try {
      final response = await http.post(uri, headers: headers, body: body);
      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final metadataJson = data['result']['value']?['data'];

        if (metadataJson != null) {
          final metadata = TokenMetadata.fromJson(metadataJson);
          print('Parsed Token Metadata: $metadata');
          return metadata;
        } else {
          print('No metadata found for mint address: $mintAddress');
          return null;
        }
      } else {
        print('Error fetching token metadata: ${response.body}');
        throw Exception('Error fetching token metadata: ${response.body}');
      }
    } catch (e) {
      print('Failed to fetch token metadata: $e');
      throw Exception('Failed to fetch token metadata: $e');
    }
  }

  Future<String> getMetadataAccount(String mintAddress) async {
    const metadataProgramId =
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"; // Metaplex Token Metadata Program ID

    final metadataPubkey = Pubkey.fromBase58(metadataProgramId);
    final mintPubkey = Pubkey.fromBase58(mintAddress);

    // Log the generated public keys for debugging
    print("Metadata Program Public Key: ${metadataPubkey.toBase58()}");
    print("Mint Public Key: ${mintPubkey.toBase58()}");

    try {
      // Use `findProgramAddress` to derive the metadata account
      final programAddress = Pubkey.findProgramAddress(
        [
          utf8.encode("metadata"), // Metadata prefix
          metadataPubkey.toBytes(), // Metaplex program ID
          mintPubkey.toBytes(), // Mint address
        ],
        metadataPubkey,
      );

      // Log the derived metadata account address
      print(
          "Derived Metadata Account Address: ${programAddress.pubkey.toBase58()}");

      return programAddress.pubkey.toBase58();
    } catch (e) {
      // Handle errors gracefully
      print("Error deriving program address: $e");
      return "Metadata not found or error deriving address.";
    }
  }
}
