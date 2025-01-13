import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/wallet_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet Home'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Welcome to Solana Wallet',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              // If the wallet is connected, show the wallet address, else show the button
              walletProvider.isConnected
                  ? Column(
                      children: [
                        Text(
                          'Connected Wallet: ${walletProvider.wallet?.toBase58() ?? ''}',
                          style: const TextStyle(fontSize: 16),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: () {
                            walletProvider.disconnectWallet();
                          },
                          child: const Text('Disconnect Wallet'),
                        ),
                      ],
                    )
                  : ElevatedButton(
                      onPressed: () {
                        walletProvider.connectToWallet();
                      },
                      child: const Text('Connect to Wallet'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
