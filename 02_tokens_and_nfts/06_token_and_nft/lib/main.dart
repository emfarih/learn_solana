import 'package:flutter/material.dart';
import 'package:token_and_nft/helper.dart';
import 'package:token_and_nft/home_screen.dart';
import 'package:token_and_nft/send_screen.dart';
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
  ];

  void _onItemTapped(int index) {
    final walletProvider = Provider.of<WalletProvider>(context, listen: false);

    // Only allow tapping on the "Send" tab if the wallet is connected
    if (index == 1 && !walletProvider.isConnected) {
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
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.send),
            label: 'Send',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blueAccent,
        onTap: _onItemTapped,
        // Disable the "Send" tab if the wallet is not connected
        type: BottomNavigationBarType.fixed,
        enableFeedback: walletProvider.isConnected,
      ),
    );
  }
}
