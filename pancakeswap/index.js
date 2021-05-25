/*
Here's how to run this file
node index.js tokenaddress
example to buy mempad:
node index.js 0x9d70a3EE3079A6FA2bB16591414678b7Ad91f0b5

Pre-req:
- Account on quiknode.pro
- YOUR-WALLET_ADDRESS
- Your wallet phrase (mnemonic) that you will always keep to yourself.
*/
if( !(2 in process.argv) ) {
  console.log("Please pass the token address!!");
  return;
}

const ethers = require('ethers');

const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    TOKENTOBUY: process.argv[2],
    //TOKENTOBUY: '0x9d70a3ee3079a6fa2bb16591414678b7ad91f0b5',
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', 
    router: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
    recipient: 'YOUR-WALLET_ADDRESS'
  }

const mnemonic = 'YOUR 12 char wallet pass phrase';
const webSocketProvider = 'wss://YOUR-QUICKNODE-URL-HERE';
//const amountToBuyFor = "20"; // max WBNB to buy token for
const amountToBuyFor = "0.5"; // FOR TESTING
const mygasPrice = ethers.utils.parseUnits('20', 'gwei');
const mygasLimit = 210000;
const myMaxSlippage = 20; // Keep high when using in bot mode to increase chances of buying, Set it as 49 for extremely competitive token launches

const provider = new ethers.providers.WebSocketProvider(webSocketProvider);

const wallet = new ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

const router = new ethers.Contract(
  addresses.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
  ],
  account
);

let baseNonce = provider.getTransactionCount(wallet.getAddress());
let nonceOffset = 0;
function getNonce() {
  return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
}

const wbnb1 = new ethers.Contract(
    addresses.WBNB,
    [
      'function approve(address spender, uint amount) public returns(bool)',
    ],
    account
  );
  
  const valueToapprove = ethers.utils.parseUnits('1', 'ether');
  const init = async () => {
    const tx = await wbnb1.approve(
      router.address, 
      valueToapprove,
      {
          gasPrice: mygasPrice,
          gasLimit: mygasLimit, 
          nonce: getNonce()
      }
    );
    const receipt = await tx.wait(); 
    console.log('Transaction receipt');
    console.log(receipt);
  } 

  init();
  
  const testtx = async () => {

  let tokenIn = addresses.WBNB , tokenOut = addresses.TOKENTOBUY;

  const amountIn = ethers.utils.parseUnits(amountToBuyFor, 'ether').add(123);
  const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
  //Our execution price will be a bit different, we need some flexbility
  const amountOutMin = amounts[1].sub(amounts[1].div(myMaxSlippage)).add(123);

  console.log(`
    Buying token
    =================
    tokenIn: ${amountIn} ${tokenIn} (WBNB)
    tokenOut: ${amountOutMin} ${tokenOut}
  `);

  const tx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenIn, tokenOut],
    addresses.recipient,
    Math.floor(Date.now() / 1000) + 60 * 1, // 20 minutes from the current Unix time
    {
        gasPrice: mygasPrice,
        gasLimit: mygasLimit,
        nonce: getNonce()
    }
  );
  const receipt = await tx.wait(); 
  console.log('Transaction receipt');
  console.log(receipt);
}
testtx();