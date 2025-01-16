import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:token_and_nft/wallet_provider.dart';

class CreateTokenMintPage extends StatefulWidget {
  const CreateTokenMintPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _CreateTokenMintPageState createState() => _CreateTokenMintPageState();
}

class _CreateTokenMintPageState extends State<CreateTokenMintPage> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final walletProvider = Provider.of<WalletProvider>(context);
    final TextEditingController _nameController = TextEditingController()
      ..text = 'My Token';
    final TextEditingController _symbolController = TextEditingController()
      ..text = 'MT';
    final TextEditingController _uriController = TextEditingController()
      ..text = 'https://mytoken.com';
    final TextEditingController _decimalsController = TextEditingController()
      ..text = '2';
    final TextEditingController _initialSupplyController =
        TextEditingController()..text = '1000';

    void _submitForm() {
      if (_formKey.currentState!.validate()) {
        final String name = _nameController.text;
        final String symbol = _symbolController.text;
        final String uri = _uriController.text;
        final int decimals = int.parse(_decimalsController.text);
        final double initialSupply =
            double.parse(_initialSupplyController.text);

        walletProvider.createTokenMint(
          name: name,
          symbol: symbol,
          uri: uri,
          decimals: decimals,
          initialSupply: initialSupply,
        );

        // Show success dialog
        // showDialog(
        //   context: context,
        //   builder: (context) => AlertDialog(
        //     title: const Text('Success'),
        //     content: const Text('Token mint created successfully!'),
        //     actions: [
        //       TextButton(
        //         onPressed: () => Navigator.of(context).pop(),
        //         child: const Text('OK'),
        //       ),
        //     ],
        //   ),
        // );

        // Clear form fields
        _formKey.currentState!.reset();
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Token Mint'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Token Name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a token name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _symbolController,
                decoration: const InputDecoration(
                  labelText: 'Token Symbol',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a token symbol';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _uriController,
                decoration: const InputDecoration(
                  labelText: 'Token URI',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a token URI';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _decimalsController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Decimals',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the number of decimals';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _initialSupplyController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Initial Supply',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the initial supply';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitForm,
                child: const Text('Create Token Mint'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
