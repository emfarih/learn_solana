// phantom_wallet.dart

// ignore: avoid_web_libraries_in_flutter
import 'dart:async';
// ignore: avoid_web_libraries_in_flutter
import 'dart:js' as js;
import 'package:flutter/material.dart';
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
  double balance = 0.0;

  // Function to connect to Phantom Wallet using the provider
  Future<void> connect() async {
    try {
      final provider =
          js.context['phantom']?['solana']; // Getting the Phantom provider

      if (provider == null) {
        print("Phantom provider not found");
        return;
      }

      // Attempt to connect and get the public key
      final resp = await promiseToFuture(provider.callMethod('connect'));

      // On success, extract the public key
      account = resp['publicKey'].toString();
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
      final provider =
          js.context['phantom']?['solana']; // Getting the Phantom provider

      if (provider == null) {
        print("Phantom provider not found");
        return;
      }

      // Call the disconnect method on the Phantom provider
      await promiseToFuture(provider.callMethod('disconnect'));

      // Reset the state
      account = '';
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

  // Function to sign a transaction using Phantom Wallet
  Future<void> signTransaction(js.JsObject transaction) async {
    try {
      await js.context.callMethod('signTransaction', [transaction]);
      print('Transaction signed');
    } catch (e) {
      print('Error signing transaction: $e');
    }
  }

  // Function to fetch the balance using Solana Web3 API
  // Update the balance
  Future<void> updateBalance() async {
    final cluster = Cluster.devnet;
    final Connection connection = Connection(cluster);
    final accountPubkey = Pubkey.fromBase58(account);

    try {
      final lamports = await connection.getBalance(accountPubkey);
      balance = lamports / lamportsPerSol;
      notifyListeners();
    } catch (e) {
      print('Error fetching balance: $e');
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
