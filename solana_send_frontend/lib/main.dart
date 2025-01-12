import 'package:flutter/material.dart';
import 'package:solana_wallet_adapter/solana_wallet_adapter.dart'; // Import wallet adapter
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';

void main() {
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
  final TextEditingController _receiverController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final cluster = Cluster.devnet;

  late SolanaWalletAdapter adapter;
  Pubkey? wallet;
  double balance = 0.0;
  bool isConnected = false;

  @override
  void initState() {
    super.initState();
    adapter = SolanaWalletAdapter(AppIdentity(), cluster: cluster);
  }

  //Callback when connected to wallet
  void _onConnect(Pubkey? wallet) {
    print('Wallet connected: $wallet'); // Print the wallet object
    setState(() {
      isConnected = true;
      this.wallet = wallet;
    });
    _updateBalance();
  }

  // Callback when disconnected from wallet
  Future<void> _onDisconnect() async {
    try {
      print('Disconnecting from wallet...');
      await adapter.deauthorize();
      setState(() {
        isConnected = false;
        wallet = null;
        balance = 0.0;
      });
      print('Disconnected from wallet successfully');
    } catch (e) {
      print('Error during disconnection: $e');
    }
  }

  Future<void> _connectToWallet() async {
    try {
      print(
          'Adapter Store Apps: ${adapter.store.apps}'); // Print apps from the adapter store
      if (!adapter.isAuthorized) {
        print('Authorizing wallet...'); // Log when starting authorization
        await adapter.authorize(
          walletUriBase: adapter.store.apps[1].walletUriBase,
        );
        print(
            'Authorization successful!'); // Log when authorization is successful

        if (adapter.connectedAccount != null) {
          final pubKey =
              Pubkey.tryFromBase64(adapter.connectedAccount!.address);
          print(
              'Connected wallet address: $pubKey'); // Log connected wallet address
          _onConnect(pubKey); // Call onConnect method
        } else {
          print('No connected account found'); // Log if no account is connected
        }
      } else {
        print('Already authorized'); // Log if already authorized
      }
    } catch (e) {
      print('Error in _connectToWallet: $e'); // Log any errors
      _showSnackBar('Error: $e');
    }
  }

  Future<void> _updateBalance() async {
    final Connection connection = Connection(cluster);
    try {
      if (wallet == null) {
        throw Exception('Wallet not connected');
      } else {
        final lamports = await connection.getBalance(wallet!);
        setState(() {
          balance = lamports / lamportsPerSol; // Convert lamports to SOL
        });
        print('Wallet balance fetched: $lamports lamports');
        print('Wallet balance: $balance SOL');
      }
    } catch (e) {
      _showSnackBar('Failed to fetch balance: $e');
    }
  }

  void _sendSol() async {
    final Connection connection = Connection(cluster);
    final recipient = _receiverController.text;
    final amount = double.tryParse(_amountController.text);

    if (recipient.isEmpty || amount == null) {
      _showSnackBar('Please enter a valid recipient and amount.');
      print('Invalid input: recipient: $recipient, amount: $amount');
      return;
    }

    try {
      // Convert amount to lamports as BigInt
      BigInt lamports = BigInt.from(amount * lamportsPerSol);
      print('Amount converted to lamports: $lamports');

      if (balance < (lamports.toDouble() / lamportsPerSol)) {
        throw Exception("Insufficient balance.");
      }

      // Create the transaction instruction with BigInt lamports
      final TransactionInstruction instruction = SystemProgram.transfer(
        fromPubkey: wallet!,
        toPubkey: Pubkey.fromBase58(recipient),
        lamports: lamports,
      );

      final latestBlockhash = await connection.getLatestBlockhash();
      print('Latest blockhash: ${latestBlockhash.blockhash}');

      // Create the transaction
      final Transaction transaction = Transaction.v0(
        payer: wallet!,
        instructions: [instruction],
        recentBlockhash: latestBlockhash.blockhash,
      );
      print('Transaction created: $transaction');

      final encodedTransaction = adapter.encodeTransaction(transaction);
      print('Encoded transaction: $encodedTransaction');

      final signedTransaction =
          await adapter.signTransactions([encodedTransaction]);
      print('Signed transaction: $signedTransaction');

      final signature = await connection
          .sendSignedTransactions(signedTransaction.signedPayloads);
      print('Signature: $signature');

      _showSnackBar('Transaction successful! Signature: $signature');
      await _updateBalance();
    } catch (e) {
      print('Transaction failed: $e');
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
      appBar: AppBar(title: const Text('Solana Wallet')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Wallet Address and Balance
            Card(
              elevation: 4.0,
              margin: const EdgeInsets.only(bottom: 16),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Wallet Address:',
                      style: Theme.of(context)
                          .textTheme
                          .bodyLarge
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      wallet != null ? wallet.toString() : 'Not connected',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Balance:',
                      style: Theme.of(context)
                          .textTheme
                          .bodyLarge
                          ?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      balance != 0.0 ? '$balance SOL' : '0.0 SOL',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),

            // Connect / Disconnect Button
            ElevatedButton(
              onPressed: isConnected ? _onDisconnect : _connectToWallet,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
                backgroundColor:
                    isConnected ? Colors.redAccent : Colors.greenAccent,
              ),
              child: Text(
                isConnected ? 'Disconnect' : 'Connect to Wallet',
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 24),

            // Recipient Address Field
            TextField(
              controller: _receiverController,
              decoration: const InputDecoration(
                labelText: 'Recipient Address',
                border: OutlineInputBorder(),
              ),
              style: const TextStyle(fontSize: 16),
              enabled: isConnected, // Disable if not connected
            ),
            const SizedBox(height: 16),

            // Amount Field
            TextField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Amount (SOL)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 16),
              enabled: isConnected, // Disable if not connected
            ),
            const SizedBox(height: 24),

            // Send Button
            ElevatedButton(
              onPressed:
                  isConnected ? _sendSol : null, // Disable if not connected
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
                backgroundColor: isConnected ? Colors.blueAccent : Colors.grey,
              ),
              child: const Text(
                'Send SOL',
                style: TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
