import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/phantom_wallet.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final phantomWallet = Provider.of<PhantomWallet>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet Home'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                'Welcome to Solana Wallet',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 30),
              phantomWallet.isConnected
                  ? Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black26,
                                offset: Offset(0, 4),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Text(
                                'Connected Wallet:',
                                style: const TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                phantomWallet.account,
                                style: const TextStyle(
                                    fontSize: 14, fontStyle: FontStyle.italic),
                              ),
                              const SizedBox(height: 20),
                              Text(
                                'Balance: ${phantomWallet.balance ?? 'Loading...'} SOL',
                                style: const TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.w500),
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton(
                                onPressed: () {
                                  phantomWallet.disconnect();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors
                                      .redAccent, // Replaced 'primary' with 'backgroundColor'
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20, vertical: 10),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: const Text('Disconnect Wallet'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : ElevatedButton(
                      onPressed: () {
                        phantomWallet.connect();
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 40, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Connect to Wallet',
                        style: TextStyle(fontSize: 18),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
