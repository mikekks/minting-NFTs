import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contract from './contracts/NFTCollectible.json';

const contractAddress = "0x37917bD177F41Ca4c5002688914Ea8Fd1a0800aD";  // smart contract address
const abi = contract.abi;  

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;  // metamask 설치되어 있는지 확인

    if (!ethereum) {  // metamask가 설치 안되었다는 의미
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });  // 연결된 메타마스크의 주소

    if (accounts.length !== 0) {  // 계정이 있다면
      const account = accounts[0]; // 계정 주소
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {  // 계정이 없을 때
      console.log("No authorized account found");
    }
   }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });  // 사용자의 계정을 검색할 수 없으면 사용자가 계정 요청을 시작하도록 권장해야 합니다.
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]); // 맨 아래 if문 true로 만들기
    } catch (err) {
      console.log(err)
    }
   }

   // 실질적으로 NFTCollectible.sol과 통신하는 곳
  const mintNftHandler = async () => {
    try {
      const { ethereum } = window; 

        if (ethereum) {  // metamask가 설치되었다면
          const provider = new ethers.providers.Web3Provider(ethereum);  // 뭔가 메타마스크랑 연결하는 건데
          const signer = provider.getSigner();  // JsonRpcSigner 반환, 서명자 의미
          const nftContract = new ethers.Contract(contractAddress, abi, signer);  // 실질적으로 NFTCollectible.sol 과 연결.

          console.log("Initialize payment");
          let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther("0.01") }); //NFTCollectible.sol 에 있는 mintNFTs 호출하면서 metamask에 0.01 ETH 보낸다.

          console.log("Mining... please wait");
          await nftTxn.wait();

          console.log(`Mined, see transaction: http://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object does not exist");
        }
    } catch (err) {
      console.log(err);
    }
   }

   const burnNftHandler = async () => {
    try {
      const { ethereum } = window; 

        if (ethereum) {  // metamask가 설치되었다면
          const provider = new ethers.providers.Web3Provider(ethereum);  // 뭔가 메타마스크랑 연결하는 건데
          const signer = provider.getSigner();  // JsonRpcSigner 반환, 서명자 의미
          const nftContract = new ethers.Contract(contractAddress, abi, signer);  // 실질적으로 NFTCollectible.sol 과 연결.

          console.log("Initialize payment");
          let nftTxn = await nftContract.burnNFTs(); 

          console.log("Burning... please wait");
          await nftTxn.wait();

          console.log(`burned, see transaction: http://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
          console.log("Ethereum object does not exist");
        }
    } catch (err) {
      console.log(err);
    }
   }


   // 버튼 조작
  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
      
    )
  }

  const burnNftButton = () => {
    return (
      <button onClick={burnNftHandler} className='cta-button1 burn-nft-button'>
        Burn NFT
      </button>
    )
  }

  useEffect(() => {   // 문서 타이틀을 업데이트 하기 위해서
    checkWalletIsConnected();
  }, [])

  // 웹사이트로 보이는 부분
  return (
    <div className='main-app'>
      <h1>Scrappy Squirrels Tutorial</h1>
      <div>
      {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>
      <h1></h1>
      <div>
      {burnNftButton()}
      </div>
    </div>
  )
}

export default App;