import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/wallet_provider.dart';

class SendScreen extends StatelessWidget {
  const SendScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController receiverController = TextEditingController();
    final TextEditingController amountController = TextEditingController();
    final walletProvider = Provider.of<WalletProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Send SOL'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Display wallet balance
            Text(
              'Balance: ${walletProvider.balance} SOL',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: receiverController,
              decoration: const InputDecoration(
                labelText: 'Recipient Address',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: amountController,
              decoration: const InputDecoration(
                labelText: 'Amount (SOL)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () async {
                final recipient = receiverController.text;
                final amount = double.tryParse(amountController.text);

                // Validate input
                if (recipient.isEmpty || amount == null || amount <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content:
                            Text('Please enter valid recipient and amount')),
                  );
                  return;
                }

                // Attempt to send SOL
                final signature =
                    await walletProvider.sendSol(recipient, amount);

                if (signature != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(
                            'Successfully sent $amount SOL. Signature: $signature')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Transaction failed. Please try again.')),
                  );
                }

                // Optionally, refresh the balance after the transaction
                await walletProvider.updateBalance();
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                backgroundColor: Colors.blueAccent,
              ),
              child: const Text(
                'Send',
                style: TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
