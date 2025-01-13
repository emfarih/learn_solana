import 'package:flutter/material.dart';
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';
import 'package:solana_wallet_adapter/solana_wallet_adapter.dart';

class WalletProvider with ChangeNotifier {
  Pubkey? wallet;
  double balance = 0.0;
  bool isConnected = false;
  SolanaWalletAdapter? adapter; // Make the adapter nullable
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
      if (adapter == null) {
        throw Exception("Wallet adapter is not initialized.");
      }

      print(
          'Adapter initialized: ${adapter!.store}'); // Print adapter for debugging

      // Proceed with the authorization check
      if (adapter!.store.apps.isEmpty || adapter!.store.apps.length < 2) {
        throw Exception("The apps list is empty or has fewer than two items.");
      }

      print('Adapter Store Apps: ${adapter!.store.apps}'); // Log the apps

      if (!adapter!.isAuthorized) {
        print('Authorizing wallet...');
        await adapter!.authorize(
          walletUriBase: adapter!.store.apps[1].walletUriBase,
        );
        print('Authorization successful!');

        if (adapter!.connectedAccount != null) {
          final pubKey =
              Pubkey.tryFromBase64(adapter!.connectedAccount!.address);
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
  void sendSol(String recipient, double amount) async {
    if (adapter == null) {
      print('Adapter is not initialized');
      return;
    }

    final Connection connection = Connection(cluster);

    try {
      BigInt lamports = BigInt.from(amount * lamportsPerSol);
      print('Amount converted to lamports: $lamports');

      if (balance < (lamports.toDouble() / lamportsPerSol)) {
        throw Exception("Insufficient balance.");
      }

      // Create the transaction instruction with BigInt lamports
      final TransactionInstruction instruction = SystemProgram.transfer(
        fromPubkey: wallet!,
        toPubkey: Pubkey.fromBase58(recipient),
        lamports: lamports,
      );

      final latestBlockhash = await connection.getLatestBlockhash();
      print('Latest blockhash: ${latestBlockhash.blockhash}');

      // Create the transaction
      final Transaction transaction = Transaction.v0(
        payer: wallet!,
        instructions: [instruction],
        recentBlockhash: latestBlockhash.blockhash,
      );
      print('Transaction created: $transaction');

      final encodedTransaction = adapter!.encodeTransaction(transaction);
      print('Encoded transaction: $encodedTransaction');

      final signedTransaction =
          await adapter!.signTransactions([encodedTransaction]);
      print('Signed transaction: $signedTransaction');

      final signature = await connection
          .sendSignedTransactions(signedTransaction.signedPayloads);
      print('Signature: $signature');

      await updateBalance();
    } catch (e) {
      print('Transaction failed: $e');
    }
  }
}
