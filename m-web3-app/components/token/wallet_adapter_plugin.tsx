import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { Umi, UmiPlugin } from "@metaplex-foundation/umi";
import { WalletContextState } from "@solana/wallet-adapter-react";

class WalletAdapterPlugin implements UmiPlugin {
  private wallet;

  constructor(wallet: WalletContextState) {
    this.wallet = wallet;
  }

  install(umi: Umi) {
    if (!this.wallet || !this.wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    if (!this.wallet.signTransaction) {
      console.error("Wallet does not support transaction signing");
      return;
    }

    umi.identity = createSignerFromWalletAdapter(this.wallet);
  }
}
