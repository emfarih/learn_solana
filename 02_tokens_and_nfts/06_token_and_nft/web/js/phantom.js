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
  
  function signTransaction(transaction) {
    return window.phantom.solana.signTransaction(transaction);
  }
  
  // Expose these methods for Dart to call
  window.connectPhantomWallet = connectPhantomWallet;
  window.getAccount = getAccount;
  window.signTransaction = signTransaction;
  