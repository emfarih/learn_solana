// phantom_wallet.dart

// ignore: avoid_web_libraries_in_flutter
import 'dart:async';
import 'dart:convert';
// ignore: avoid_web_libraries_in_flutter
import 'dart:js' as js;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:solana_wallet_adapter/solana_wallet_adapter.dart';
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';

class PhantomWallet with ChangeNotifier {
  // Private constructor to prevent instantiation
  PhantomWallet._internal();

  // The singleton instance
  static final PhantomWallet _instance = PhantomWallet._internal();

  // Factory constructor to provide access to the singleton instance
  factory PhantomWallet() {
    return _instance;
  }

  // State variables
  bool isConnected = false;
  String account = '';
  Pubkey accountPubkey = Pubkey.zero();
  double balance = 0.0;
  final cluster = Cluster.devnet;
  final provider =
      js.context['phantom']?['solana']; // Getting the Phantom provider

  // Function to connect to Phantom Wallet using the provider
  Future<void> connect() async {
    try {
      if (provider == null) {
        print("Phantom provider not found");
        return;
      }

      // Attempt to connect and get the public key
      final resp = await promiseToFuture(provider.callMethod('connect'));

      // On success, extract the public key
      account = resp['publicKey'].toString();
      accountPubkey = Pubkey.fromBase58(account);
      isConnected = true;
      await updateBalance();
      notifyListeners();
      print('Connected to Phantom Wallet: $account');
    } catch (e) {
      isConnected = false;
      print('Error connecting to Phantom: $e');
    }
  }

  // Function to disconnect from Phantom Wallet
  Future<void> disconnect() async {
    try {
      if (provider == null) {
        print("Phantom provider not found");
        return;
      }

      // Call the disconnect method on the Phantom provider
      await promiseToFuture(provider.callMethod('disconnect'));

      // Reset the state
      account = '';
      accountPubkey = Pubkey.zero();
      balance = 0.0;
      isConnected = false;
      notifyListeners();

      print('Disconnected from Phantom Wallet');
    } catch (e) {
      print('Error disconnecting from Phantom: $e');
    }
  }

  // Function to retrieve account from Phantom Wallet
  Future<String> getAccount() async {
    try {
      return js.context.callMethod('getAccount');
    } catch (e) {
      print('Error getting account: $e');
      return '';
    }
  }

  // Function to fetch the balance using Solana Web3 API
  // Update the balance
  Future<void> updateBalance() async {
    final Connection connection = Connection(cluster);

    try {
      final lamports = await connection.getBalance(accountPubkey);
      balance = lamports / lamportsPerSol;
      notifyListeners();
    } catch (e) {
      print('Error fetching balance: $e');
    }
  }

  Future<String?> sendSol(String recipient, double amount) async {
    try {
      if (!isConnected) {
        throw Exception("Wallet is not connected.");
      }

      final Connection connection = Connection(cluster);

      // Convert amount to lamports
      final lamports = BigInt.from(amount * lamportsPerSol);

      // Create transaction
      final blockhash = await connection.getLatestBlockhash();
      final transferInstruction = SystemProgram.transfer(
        fromPubkey: accountPubkey,
        toPubkey: Pubkey.fromBase58(recipient),
        lamports: lamports,
      );
      final transaction = Transaction.v0(
        payer: accountPubkey,
        instructions: [transferInstruction],
        recentBlockhash: blockhash.blockhash,
      );
      print('Transaction created: ${transaction.toJson()}');

      // Serialize the transaction to a Buffer
      final serializedBuffer = transaction.serialize();
      final Uint8List serializedTransaction =
          Uint8List.fromList(serializedBuffer.toList());

      // Encode the serialized transaction to base64
      final String base64Transaction = base64Encode(serializedTransaction);

      final signedTransaction = await promiseToFuture(
        provider.callMethod('signAndSendTransaction', [base64Transaction]),
      );
      print('Transaction signed: $signedTransaction');

      // Update balance after transaction
      await updateBalance();
      return null;
    } catch (e, stackTrace) {
      print('Error sending SOL: $e');
      print('Stack trace: $stackTrace');
      return null;
    }
  }
}

// Helper function to convert JS promises to Dart Future
Future<T> promiseToFuture<T>(js.JsObject promise) {
  final completer = Completer<T>();
  promise.callMethod('then', [
    js.allowInterop((value) {
      completer.complete(value);
    })
  ]);
  promise.callMethod('catch', [
    js.allowInterop((error) {
      completer.completeError(error);
    })
  ]);
  return completer.future;
}
