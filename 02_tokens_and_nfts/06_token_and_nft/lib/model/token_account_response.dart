class TokenAccountResponse {
  final int slot;
  final List<TokenAccount> accounts;

  TokenAccountResponse({required this.slot, required this.accounts});

  factory TokenAccountResponse.fromJson(Map<String, dynamic> json) {
    final context = json['result']['context'];
    final slot = context['slot'] as int;
    final accountsJson = json['result']['value'] as List<dynamic>;
    final accounts = accountsJson.map((e) => TokenAccount.fromJson(e)).toList();

    return TokenAccountResponse(slot: slot, accounts: accounts);
  }
}

class TokenAccount {
  final String pubkey;
  final TokenAccountInfo accountInfo;

  TokenAccount({required this.pubkey, required this.accountInfo});

  factory TokenAccount.fromJson(Map<String, dynamic> json) {
    return TokenAccount(
      pubkey: json['pubkey'] as String,
      accountInfo: TokenAccountInfo.fromJson(json['account']),
    );
  }
}

class TokenAccountInfo {
  final String mint;
  final String owner;
  final TokenAmount tokenAmount;

  TokenAccountInfo(
      {required this.mint, required this.owner, required this.tokenAmount});

  factory TokenAccountInfo.fromJson(Map<String, dynamic> json) {
    final parsed = json['data']['parsed'];
    final info = parsed['info'];
    return TokenAccountInfo(
      mint: info['mint'] as String,
      owner: info['owner'] as String,
      tokenAmount: TokenAmount.fromJson(info['tokenAmount']),
    );
  }
}

class TokenAmount {
  final String amount;
  final int decimals;
  final double uiAmount;
  final String uiAmountString;

  TokenAmount({
    required this.amount,
    required this.decimals,
    required this.uiAmount,
    required this.uiAmountString,
  });

  factory TokenAmount.fromJson(Map<String, dynamic> json) {
    return TokenAmount(
      amount: json['amount'] as String,
      decimals: json['decimals'] as int,
      uiAmount: (json['uiAmount'] as num).toDouble(),
      uiAmountString: json['uiAmountString'] as String,
    );
  }
}
