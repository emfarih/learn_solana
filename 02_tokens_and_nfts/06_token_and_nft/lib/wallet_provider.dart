import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:solana_wallet_adapter/solana_wallet_adapter.dart';
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';
import 'package:http/http.dart' as http;
import 'package:token_and_nft/helper.dart';
import 'package:token_and_nft/model/token_account_response.dart';
import 'package:token_and_nft/rpc_calls_helper.dart';

class WalletProvider with ChangeNotifier {
  Pubkey? wallet;
  double balance = 0.0;
  bool isConnected = false;
  late SolanaWalletAdapter adapter; // Use late initialization
  static final Cluster cluster = Cluster.devnet;

  // Initialize the wallet adapter
  Future<void> initWalletAdapter() async {
    adapter = SolanaWalletAdapter(AppIdentity(), cluster: cluster);
    print('Adapter initialized: $adapter'); // Log initialization for debugging
    print('Adapter cluster: ${adapter.cluster!.uri}');
    notifyListeners();
  }

  // Send SOL to another address
  Future<List<TransactionSignature?>?> sendSol(
      String recipient, double amount) async {
    final Connection connection = Connection(cluster);

    try {
      // Debugging: Check the connection and adapter clusters
      print('--- Debugging Info ---');
      print('Connection cluster: ${connection.httpCluster.uri}');
      print('Adapter cluster: ${adapter.cluster?.uri}');
      print('Recipient address: $recipient');
      print('Amount to send: $amount SOL');
      print('Current wallet address: ${wallet?.toBase58()}');
      print('Current balance: $balance SOL');
      print('-----------------------');

      // Convert SOL to lamports
      BigInt lamports = BigInt.from(amount * lamportsPerSol);
      print('Amount converted to lamports: $lamports');

      // Check for sufficient balance
      if (balance < (lamports.toDouble() / lamportsPerSol)) {
        print('Error: Insufficient balance.');
        throw Exception("Insufficient balance.");
      }

      // Debug: Log the blockhash retrieval
      final latestBlockhash = await connection.getLatestBlockhash();
      print('Latest blockhash: ${latestBlockhash.blockhash}');

      // Debug: Log transaction creation details
      final TransactionInstruction instruction = SystemProgram.transfer(
        fromPubkey: wallet!,
        toPubkey: Pubkey.fromBase58(recipient),
        lamports: lamports,
      );

      final Transaction transaction = Transaction.v0(
        payer: wallet!,
        instructions: [instruction],
        recentBlockhash: latestBlockhash.blockhash,
      );
      print('Transaction created: $transaction');

      // Encode the transaction
      final encodedTransaction = adapter.encodeTransaction(transaction);
      print('Encoded transaction: $encodedTransaction');

      // Debug: Log before signing the transaction
      print('Attempting to sign the transaction...');
      final signedTransaction =
          await adapter.signTransactions([encodedTransaction]);
      print('Signed transaction: $signedTransaction');

      // Debug: Log before sending the signed transaction
      print('Sending signed transaction...');
      final signature = await connection
          .sendSignedTransactions(signedTransaction.signedPayloads);
      print('Transaction sent. Signature: $signature');

      // Update balance after the transaction
      print('Updating wallet balance...');
      await updateBalance();
      print('Updated balance: $balance SOL');

      // Return the transaction signature
      return signature;
    } catch (e, stackTrace) {
      // Log detailed error and stack trace
      print('Transaction failed: $e');
      print('Stack trace: $stackTrace');
      return null; // Return null if the transaction failed
    }
  }

  // Connect to the wallet
  Future<void> connectToWallet() async {
    try {
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
    final Connection connection = Connection(cluster);
    if (wallet == null) return;
    try {
      final lamports = await connection.getBalance(wallet!);
      balance = lamports / lamportsPerSol;
      notifyListeners();
    } catch (e) {
      print('Error fetching balance: $e');
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
    final body =
        jsonEncode(getTokenAccountsByOwnerInstruction(wallet!.toBase58()));

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

  void decodeMetadata(String base64Data) {
    final decodedBytes = base64.decode(base64Data);
    print("Decoded Metadata: ${utf8.decode(decodedBytes)}");
  }

  Future<TokenMetadata?> fetchTokenMetadata(String mintAddress) async {
    final metadataAccount = await getMetadataAccount(mintAddress);

    print('Fetching metadata for Mint Address: $mintAddress');
    print('Derived Metadata Account: $metadataAccount');

    final uri = adapter.cluster!.uri;
    final headers = {'Content-Type': 'application/json'};
    final body = jsonEncode(getAccountInfoInstruction(metadataAccount));

    print('Request URI: $uri');
    print('Request Body: $body');

    try {
      final response = await http.post(uri, headers: headers, body: body);
      print('Response Status Code: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final metadataBase64 = data['result']['value']?['data']
            ?[0]; // Access the base64-encoded metadata

        if (metadataBase64 != null) {
          // Decode the base64-encoded metadata
          final decodedMetadata = base64Decode(metadataBase64);
          print('Decoded Metadata (Bytes): $decodedMetadata');

          List<String> chunks = parseAndDecodeMetadata(decodedMetadata);
          print('Chunks: $chunks');

          final tokenMetadata =
              TokenMetadata(name: chunks[0], symbol: chunks[2], uri: chunks[3]);
          print('Parsed Token Metadata: $tokenMetadata');

          return tokenMetadata;
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

  Future<void> createTokenMint({
    required String name,
    required String symbol,
    required String uri,
    required double initialSupply,
    required int decimals,
  }) async {
    final Connection connection = Connection(cluster);
    try {
      final lamports = await connection
          .getMinimumBalanceForRentExemption(0); // Adjust space if needed
      print('Minimum balance for rent exemption: $lamports');

      final mintPubkey = await generateNewPublicKey();
      print('New mint address: $mintPubkey');

      // 3. Initialize the mint (Create the mint account)
      final mintInstruction = SystemProgram.createAccount(
        fromPubkey: wallet!, // Sender's public key (your wallet)
        newAccountPubkey: mintPubkey, // New mint account public key
        lamports: BigInt.from(lamports), // Rent exemption for the new account
        space:
            BigInt.from(82), // Space for the mint (0 can be adjusted if needed)
        programId: Pubkey.fromBase58(tokenProgramId), // Token program ID
      );

      // Get the latest blockhash
      final latestBlockhash = await connection.getLatestBlockhash();
      print('Latest blockhash: ${latestBlockhash.blockhash}');

      // Create the transaction
      final Transaction mintTransaction = Transaction.v0(
        payer: wallet!,
        instructions: [mintInstruction],
        recentBlockhash: latestBlockhash.blockhash,
      );
      print('Transaction created: $mintTransaction');

      // Encode the transaction
      final encodedMintTransaction = adapter.encodeTransaction(mintTransaction);
      print('Encoded transaction: $encodedMintTransaction');

      // 3. Mint tokens to the wallet address (if required)
      // final amount =
      //     (initialSupply * (10 ^ decimals)).toInt(); // Convert to lamports

      // final mintToInstruction = TransactionInstruction(
      //   programId: Pubkey.fromBase58(tokenProgramId),
      //   keys: [
      //     AccountMeta(wallet!, isSigner: true, isWritable: true),
      //     AccountMeta(mintPubkey, isSigner: false, isWritable: true),
      //   ],
      //   data: Uint8List.fromList(utf8.encode(jsonEncode({'amount': amount}))),
      // );

      // // Create the transaction
      // final mintToTransaction = Transaction.v0(
      //   payer: wallet!,
      //   instructions: [mintToInstruction],
      //   recentBlockhash: latestBlockhash.blockhash,
      // );

      // // Encode the transaction
      // final encodedMintToTransaction =
      //     adapter.encodeTransaction(mintToTransaction);
      // print('Encoded transaction: $encodedMintToTransaction');

      // Sign the transaction
      final signedTransaction =
          await adapter.signTransactions([encodedMintTransaction]);
      print('Signed transaction: $signedTransaction');

      // Send the signed transaction and get the signature
      final signature = await connection
          .sendSignedTransactions(signedTransaction.signedPayloads);
      print('Signature: $signature');

      // // 3. Create metadata for the mint
      // // final metadataPubkey = await generateNewPublicKey();
      // final metadataPubkey = "C16NFCmxDmZhXqSUD1HD3ejzKfAXYPSYRquhi6kpAkgV";
      // print('New metadata address: $metadataPubkey');

      // final createMetadataBody = jsonEncode(createMetadataInstruction(
      //   wallet!.toBase58(), // Update authority
      //   metadataPubkey,
      //   mintPubkey,
      //   name,
      //   symbol,
      //   uri,
      // ));
      // final createMetadataResponse = await http.post(
      //   adapter.cluster!.uri,
      //   headers: headers,
      //   body: createMetadataBody,
      // );

      // if (createMetadataResponse.statusCode != 200) {
      //   throw Exception("Failed to create metadata.");
      // }

      print('Token mint created successfully.');
    } catch (e) {
      debugPrint('Error creating token: $e');
      rethrow;
    }
  }

  Future<Pubkey> generateNewPublicKey() async {
    final keyPair = await Keypair
        .generate(); // This creates a new random keypair (mint address)
    return keyPair.pubkey; // Return the public key of the mint address
  }
}
