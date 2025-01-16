import 'package:flutter/material.dart';
import 'package:token_and_nft/screen/token_screen_create_page.dart';
import 'package:token_and_nft/screen/token_screen_list_page.dart';
import 'package:token_and_nft/screen/token_screen_send_page.dart';

class TokenScreen extends StatefulWidget {
  const TokenScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _TokenScreenState createState() => _TokenScreenState();
}

class _TokenScreenState extends State<TokenScreen> {
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
