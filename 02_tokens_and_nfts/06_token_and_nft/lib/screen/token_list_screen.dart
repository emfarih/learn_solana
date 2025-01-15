import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/model/token_account_response.dart';
import 'package:token_and_nft/wallet_provider.dart';

class TokenListScreen extends StatefulWidget {
  const TokenListScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _TokenListScreenState createState() => _TokenListScreenState();
}

class _TokenListScreenState extends State<TokenListScreen> {
  int _selectedIndex = 0; // To keep track of the selected tab

  // List of screens for the bottom navigation
  final List<Widget> _screens = [
    const TokenListPage(), // List tokens screen
    const CreateTokenMintPage(), // Create token mint screen
    const SendTokenPage(), // Send token screen
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Tokens'),
      ),
      body: _screens[_selectedIndex], // Show the selected screen
      bottomNavigationBar: Container(
        height: 36, // Adjust the height to half of the default
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor, // Default blue background
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: Icon(Icons.list),
              label: '', // Hide text label
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add),
              label: '', // Hide text label
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.send),
              label: '', // Hide text label
            ),
          ],
          type: BottomNavigationBarType.fixed,
          selectedItemColor: Colors.white, // Default blue theme selected color
          unselectedItemColor:
              Colors.white60, // Default blue theme unselected color
          backgroundColor: Colors
              .transparent, // Transparent background as container handles color
          elevation: 0, // No shadow
          iconSize: 16, // Smaller icons (default is around 30)
          selectedFontSize: 0, // Hide the selected label
          unselectedFontSize: 0, // Hide the unselected label
          showUnselectedLabels: false, // Don't show unselected labels
          showSelectedLabels: false, // Don't show selected labels
        ),
      ),
    );
  }
}

class TokenListPage extends StatelessWidget {
  const TokenListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);

    return walletProvider.isConnected
        ? FutureBuilder<TokenAccountResponse>(
            future: walletProvider.getTokenAccounts(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              }

              final tokenAccounts = snapshot.data?.accounts ?? [];
              if (tokenAccounts.isEmpty) {
                return const Center(child: Text('No tokens found.'));
              }

              return ListView.builder(
                itemCount: tokenAccounts.length,
                itemBuilder: (context, index) {
                  final account = tokenAccounts[index];
                  final metadata = account.metadata;

                  return Card(
                    margin: const EdgeInsets.symmetric(
                        vertical: 8.0, horizontal: 16.0),
                    child: ListTile(
                      title: Text(
                        metadata != null
                            ? '${metadata.name} (${metadata.symbol})'
                            : 'Mint: ${account.accountInfo.mint}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Owner: ${account.accountInfo.owner}'),
                          Text(
                              'Balance: ${account.accountInfo.tokenAmount.uiAmountString}'),
                          if (metadata != null) Text('URI: ${metadata.uri}'),
                        ],
                      ),
                      isThreeLine: true,
                      onTap: () {
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
                                  if (metadata != null) ...[
                                    const SizedBox(height: 8),
                                    Text('Name: ${metadata.name}'),
                                    Text('Symbol: ${metadata.symbol}'),
                                    Text('URI: ${metadata.uri}'),
                                  ],
                                ],
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(),
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
        : const Center(child: Text('Connect your wallet to view tokens.'));
  }
}

class CreateTokenMintPage extends StatelessWidget {
  const CreateTokenMintPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Create Token Mint Screen'));
  }
}

class SendTokenPage extends StatelessWidget {
  const SendTokenPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Send Token Screen'));
  }
}
