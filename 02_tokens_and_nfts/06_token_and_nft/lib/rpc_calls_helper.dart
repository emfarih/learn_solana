Object getMinimumBalanceForRentExemptionInstruction() {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getMinimumBalanceForRentExemption",
    "params": [82]
  };
}

Object createAccountInstruction(
    String newAccountPubkey, String ownerPubkey, int lamports) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "createAccount",
    "params": {
      "fromPubkey": ownerPubkey,
      "newAccountPubkey": newAccountPubkey,
      "lamports": lamports, //rent-exempt-amount
      "space": 82,
      "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    }
  };
}

Object initializeMintInstruction(
    String programId, String mintPubkey, String mintAuthority, int decimals) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initializeMint",
    "params": {
      "mintPubkey": mintPubkey,
      "mintAuthority": mintAuthority,
      "decimals": decimals
    }
  };
}

Object mintToInstruction(String programId, String mintPubkey, String destPubkey,
    String mintAuthority, int amount) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "mintTo",
    "params": {
      "mintPubkey": mintPubkey,
      "destPubkey": destPubkey,
      "amount": amount,
      "mintAuthority": mintAuthority
    }
  };
}

Object createMetadataInstruction(String updateAuthority, String metadataAccount,
    String mintAccount, String tokenName, String tokenSymbol, String tokenUri) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "createMetadata",
    "params": {
      "updateAuthority": updateAuthority,
      "metadata": metadataAccount,
      "mint": mintAccount,
      "data": {"name": tokenName, "symbol": tokenSymbol, "uri": tokenUri}
    }
  };
}

Object getAccountInfoInstruction(String accountPubkey) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": [
      accountPubkey,
      {"encoding": "jsonParsed"}
    ]
  };
}

Object getTokenAccountsByOwnerInstruction(String ownerPubkey) {
  return {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getTokenAccountsByOwner",
    "params": [
      ownerPubkey,
      {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
      {"encoding": "jsonParsed"}
    ]
  };
}
