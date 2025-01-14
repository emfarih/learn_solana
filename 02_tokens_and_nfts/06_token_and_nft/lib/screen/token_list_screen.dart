import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/model/token_account_response.dart';
import 'package:token_and_nft/wallet_provider.dart';

class TokenListScreen extends StatelessWidget {
  const TokenListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Tokens'),
      ),
      body: walletProvider.isConnected
          ? FutureBuilder<TokenAccountResponse>(
              future: walletProvider.getTokenAccounts(), // Fetch token accounts
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}'),
                  );
                }
                final tokenAccounts = snapshot.data?.accounts ?? [];
                if (tokenAccounts.isEmpty) {
                  return const Center(child: Text('No tokens found.'));
                }
                return ListView.builder(
                  itemCount: tokenAccounts.length,
                  itemBuilder: (context, index) {
                    final account = tokenAccounts[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          vertical: 8.0, horizontal: 16.0),
                      child: ListTile(
                        title: Text(
                          'Mint: ${account.accountInfo.mint}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Owner: ${account.accountInfo.owner}'),
                            Text(
                                'Balance: ${account.accountInfo.tokenAmount.uiAmountString}'),
                          ],
                        ),
                        isThreeLine: true,
                        onTap: () {
                          // Handle tap for more details
                          showDialog(
                            context: context,
                            builder: (context) {
                              return AlertDialog(
                                title: const Text('Token Details'),
                                content: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                        'Mint Address: ${account.accountInfo.mint}'),
                                    Text('Owner: ${account.accountInfo.owner}'),
                                    Text(
                                        'Amount: ${account.accountInfo.tokenAmount.amount}'),
                                    Text(
                                        'Decimals: ${account.accountInfo.tokenAmount.decimals}'),
                                    Text(
                                        'UI Amount: ${account.accountInfo.tokenAmount.uiAmount}'),
                                  ],
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.of(context).pop(),
                                    child: const Text('Close'),
                                  ),
                                ],
                              );
                            },
                          );
                        },
                      ),
                    );
                  },
                );
              },
            )
          : const Center(child: Text('Connect your wallet to view tokens.')),
    );
  }
}
