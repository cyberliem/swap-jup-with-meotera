import DLMM from '@meteora-ag/dlmm'
import { BN, Program, IdlAccounts, ProgramAccount, IdlTypes, EventParser } from '@coral-xyz/anchor';

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SendOptions,
  Commitment,
} from "@solana/web3.js";

import bs58 from 'bs58';



const your_node = "<your quiknode>"
const your_privatekey = "<your key>"
const your_pool = `GhZtugCqUskpDPiuB5zJPxabxpZZKuPZmAQtfSDB3jpZ`
const swapAmount = new BN(1000000)
const yourslippage = new BN(10000)
const swapYtoX = true;
const numberOfSwap = 5;

console.log(your_node)
//connection
const connection = new Connection(your_node, "processed");

//setup key

// change your key
let secretKey =
  bs58.decode(your_privatekey);

let user = Keypair.fromSecretKey(secretKey);

(async () => {
  console.log("starting ...")
  const SOL_USDC_POOL = new PublicKey(your_pool) // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all
  const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL);

  // Swap quote
  const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
  const swapQuote = await dlmmPool.swapQuote(
    swapAmount,
    swapYtoX,
    yourslippage,
    binArrays
  );
  const myCommitment: Commitment = 'processed'
  const customSendOptions = {
    skipPreflight: true,   // Optional, whether to skip preflight checks
    commitment: 'recent',   // Optional, commitment level for finalizing transaction
    preflightCommitment: myCommitment // Optional, commitment level for preflight checks
};
  // Swap
  const swapTx = await dlmmPool.swap({
    inToken: dlmmPool.tokenY.publicKey,
    binArraysPubkey: swapQuote.binArraysPubkey,
    inAmount: swapAmount,
    lbPair: dlmmPool.pubkey,
    user: user.publicKey,
    minOutAmount: swapQuote.minOutAmount,
    outToken: dlmmPool.tokenX.publicKey,
  });
  const transactions: Promise<string | void>[] = [];

  for (let i = 0; i < numberOfSwap; i++) {
    // Push each transaction into the array
    transactions.push(
      connection.sendTransaction(swapTx, [user], customSendOptions)
        .catch(error => console.log(`Error sending transaction ${i}:`, error))
    );
  }
  await Promise.all(transactions);

  // try {
  //   connection.sendTransaction(swapTx,[
  //     user, 
  //   ],customSendOptions);
  // } catch (error) {
  //   console.log(error)
  // }
})()
