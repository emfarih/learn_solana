import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:solana/solana.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(const SolanaWalletApp());
}

class SolanaWalletApp extends StatelessWidget {
  const SolanaWalletApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Solana Wallet',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const WalletScreen(),
    );
  }
}

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _WalletScreenState createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final solanaClient = SolanaClient(
    rpcUrl: Uri.parse('https://api.devnet.solana.com'),
    websocketUrl: Uri.parse('ws://api.devnet.solana.com'),
  );
  final TextEditingController _receiverController = TextEditingController()
    ..text = 'EXLRFGKBjZFVrVDMqHCKyNG3HeQHZdWqfaG3X7m5fkN2';
  final TextEditingController _amountController = TextEditingController()
    ..text = '0.1';

  late Ed25519HDKeyPair wallet;
  String walletAddress = '';
  double balance = 0.0;

  @override
  void initState() {
    super.initState();
    _initializeWallet();
  }

  Future<void> _initializeWallet() async {
    final secretKey = dotenv.env['SECRET_KEY'];
    if (secretKey == null) {
      _showSnackBar('SECRET_KEY not found in environment variables.');
      return;
    }

    try {
      final secretKeyBytes =
          List<int>.from(secretKey.split(',').map(int.parse));
      print('Parsed secret key bytes: $secretKeyBytes');
      final seed = secretKeyBytes.sublist(0, 32);

      wallet = await Ed25519HDKeyPair.fromPrivateKeyBytes(privateKey: seed);

      setState(() {
        walletAddress = wallet.address;
      });
      await _updateBalance();
    } catch (e) {
      _showSnackBar('Failed to initialize wallet: $e');
      if (kDebugMode) {
        print('Failed to initialize wallet: $e');
      }
    }
  }

  Future<void> _updateBalance() async {
    try {
      final lamports = await solanaClient.rpcClient.getBalance(walletAddress);
      setState(() {
        balance = lamports.value / lamportsPerSol; // Convert to SOL
      });
      print('Wallet balance: $balance SOL');
    } catch (e) {
      if (kDebugMode) {
        print('Failed to fetch balance: $e');
      }
      _showSnackBar('Failed to fetch balance: $e');
    }
  }

  Future<void> _sendSol() async {
    final recipient = _receiverController.text;
    final amount = double.tryParse(_amountController.text);

    if (recipient.isEmpty || amount == null) {
      _showSnackBar('Please enter a valid recipient and amount.');
      return;
    }

    try {
      final lamports = (amount * lamportsPerSol).toInt();

      if (balance < (lamports / lamportsPerSol)) {
        throw Exception(
            "Insufficient balance ($balance) to complete the transaction (${lamports / lamportsPerSol}).");
      }
      print('Sending $lamports lamports to $recipient');

      final signedTx = await solanaClient.transferLamports(
        source: wallet,
        destination: Ed25519HDPublicKey.fromBase58(recipient),
        lamports: lamports,
      );
      print('Transaction successful! Signature: $signedTx');
      _showSnackBar('Transaction successful! Signature: $signedTx');
      await _updateBalance();
    } catch (e) {
      if (kDebugMode) {
        print('Transaction failed: $e');
      }
      _showSnackBar('Transaction failed: $e');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Solana Wallet'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Wallet Address:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SelectableText(walletAddress),
            SizedBox(height: 16),
            Text(
              'Balance: $balance SOL',
              style: TextStyle(fontSize: 20),
            ),
            Divider(),
            TextField(
              controller: _receiverController,
              decoration: InputDecoration(labelText: 'Recipient Address'),
            ),
            TextField(
              controller: _amountController,
              decoration: InputDecoration(labelText: 'Amount (SOL)'),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _sendSol,
              child: Text('Send SOL'),
            ),
          ],
        ),
      ),
    );
  }
}
