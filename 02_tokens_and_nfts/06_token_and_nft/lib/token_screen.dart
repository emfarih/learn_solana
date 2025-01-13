import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/wallet_provider.dart';

class TokenScreen extends StatelessWidget {
  const TokenScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController mintController = TextEditingController();
    final TextEditingController amountController = TextEditingController();
    final walletProvider = Provider.of<WalletProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Token Management'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
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
            // Mint Token input
            TextField(
              controller: mintController,
              decoration: InputDecoration(
                labelText: 'Mint Token Address',
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
                labelText: 'Amount to Mint',
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
            // Mint button
            ElevatedButton(
              onPressed: () async {
                final mintAddress = mintController.text;
                final amount = double.tryParse(amountController.text);

                // Validate input
                if (mintAddress.isEmpty || amount == null || amount <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content:
                          Text('Please enter valid mint address and amount'),
                    ),
                  );
                  return;
                }

                // Attempt to mint token
                // final signature =
                //     await walletProvider.mintToken(mintAddress, amount);

                // if (signature != null) {
                //   showSnackBar(
                //       'Successfully minted $amount tokens. Signature: $signature',
                //       context);
                // } else {
                //   showSnackBar('Minting failed. Please try again.', context);
                // }

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
                'Mint Token',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Transfer Token input
            TextField(
              controller: mintController,
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
            // Transfer Amount input
            TextField(
              controller: amountController,
              decoration: InputDecoration(
                labelText: 'Amount to Transfer',
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
            // Transfer button
            ElevatedButton(
              onPressed: () async {
                final recipient = mintController.text;
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

                // Attempt to transfer token
                // final signature =
                //     await walletProvider.transferToken(recipient, amount);

                // if (signature != null) {
                //   showSnackBar(
                //       'Successfully transferred $amount tokens. Signature: $signature',
                //       context);
                // } else {
                //   showSnackBar('Transfer failed. Please try again.', context);
                // }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14.0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                backgroundColor: Colors.blueAccent,
              ),
              child: const Text(
                'Transfer Token',
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
