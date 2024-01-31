import DLMM from '@meteora-ag/dlmm'
import { BN, Program, IdlAccounts, ProgramAccount, IdlTypes, EventParser } from '@coral-xyz/anchor';

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import bs58 from 'bs58';

//connection
const connection = new Connection("<your quiknode>", "confirmed");

//setup key

// change your key
let secretKey =
  bs58.decode("<your string private key>");

let user = Keypair.fromSecretKey(secretKey);

(async () => {
  console.log("starting ...")
  const SOL_USDC_POOL = new PublicKey('FoSDw2L5DmTuQTFe55gWPDXf88euaxAEKFre74CnvQbX') // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all
  const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL);

  const swapAmount = new BN(100);
  // Swap quote
  const swapYtoX = false;
  const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
  const swapQuote = await dlmmPool.swapQuote(
    swapAmount,
    swapYtoX,
    new BN(10000),
    binArrays
  );

  // Swap
  const swapTx = await dlmmPool.swap({
    inToken: dlmmPool.tokenX.publicKey,
    binArraysPubkey: swapQuote.binArraysPubkey,
    inAmount: swapAmount,
    lbPair: dlmmPool.pubkey,
    user: user.publicKey,
    minOutAmount: swapQuote.minOutAmount,
    outToken: dlmmPool.tokenY.publicKey,
  });

  try {
    const swapTxHash = await sendAndConfirmTransaction(connection, swapTx, [
      user,
    ]);
    console.log(swapTxHash)
  } catch (error) {
    console.log(error)
  }
})()