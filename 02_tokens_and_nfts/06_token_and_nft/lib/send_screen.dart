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
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Display wallet balance
            Text(
              'Balance: ${walletProvider.balance} SOL',
              style: Theme.of(context).textTheme.titleLarge!.copyWith(
                    color: Colors.blueAccent,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 24),
            // Recipient Address input
            TextField(
              controller: receiverController,
              decoration: InputDecoration(
                labelText: 'Recipient Address',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.blue.shade50,
                contentPadding:
                    const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              ),
            ),
            const SizedBox(height: 16),
            // Amount input
            TextField(
              controller: amountController,
              decoration: InputDecoration(
                labelText: 'Amount (SOL)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.blue.shade50,
                contentPadding:
                    const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 24),
            // Send button
            ElevatedButton(
              onPressed: () async {
                final recipient = receiverController.text;
                final amount = double.tryParse(amountController.text);

                // Validate input
                if (recipient.isEmpty || amount == null || amount <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please enter valid recipient and amount'),
                    ),
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
                        'Successfully sent $amount SOL. Signature: $signature',
                      ),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Transaction failed. Please try again.'),
                    ),
                  );
                }

                // Optionally, refresh the balance after the transaction
                await walletProvider.updateBalance();
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                backgroundColor: Colors.blueAccent,
              ),
              child: const Text(
                'Send SOL',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
