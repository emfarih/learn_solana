import 'package:flutter/material.dart';
import 'package:token_and_nft/helper.dart';
import 'package:token_and_nft/screen/home_screen.dart';
import 'package:token_and_nft/screen/send_screen.dart';
import 'package:token_and_nft/screen/token_list_screen.dart';
import 'package:token_and_nft/screen/token_screen.dart'; // Import the TokenScreen
import 'package:token_and_nft/wallet_provider.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
            create: (_) => WalletProvider()..initWalletAdapter()),
      ],
      child: const SolanaWalletApp(),
    ),
  );
}

class SolanaWalletApp extends StatelessWidget {
  const SolanaWalletApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Solana Wallet',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _MainNavigationState createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    HomeScreen(),
    SendScreen(),
    TokenListScreen(), // Add TokenScreen here
  ];

  void _onItemTapped(int index) {
    final walletProvider = Provider.of<WalletProvider>(context, listen: false);

    // Only allow tapping on the "Send" and "Token" tabs if the wallet is connected
    if ((index == 1 || index == 2) && !walletProvider.isConnected) {
      // Show SnackBar if wallet is not connected
      showSnackBar("You need to connect your wallet first!", context);
      return; // Ignore tap if the wallet is not connected
    }

    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);

    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: <BottomNavigationBarItem>[
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.send),
            label: 'Send',
            // Disable "Send" tab if wallet is not connected
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.token),
            label: 'Token',
            // Disable "Token" tab if wallet is not connected
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blueAccent,
        onTap: _onItemTapped,
        // Disable feedback when wallet is not connected
        enableFeedback: walletProvider.isConnected,
      ),
    );
  }
}
