// phantom.js

window.addEventListener("load", function () {
    if (window.phantom && window.phantom.solana.isPhantom) {
      console.log("Phantom Wallet is installed!");
    } else {
      console.log("Phantom Wallet is not installed.");
    }
  });
  
  function connectPhantomWallet() {
    return window.phantom.solana.connect();
  }
  
  function getAccount() {
    return window.phantom.solana.publicKey.toString();
  }
  
  function signAndSendTransaction(transaction) {
    return window.phantom.solana.signAndSendTransaction(transaction);
  }
  
  // Expose these methods for Dart to call
  window.connectPhantomWallet = connectPhantomWallet;
  window.getAccount = getAccount;
  window.signAndSendTransaction = signAndSendTransaction;
  