import { useEffect, useRef, useState} from "react";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import { providers, Contract } from "ethers";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";


export default function Home() {

  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();



  // helper function
  const getOwner = async () => {
    try {

      const signer = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      // address of owner of smart contract
      const owner = nftContract.owner();

      // address of user currently connected to the dapp
      const userAddress = signer.getAddress();

      if(owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }

    } catch (error) {
      console.error(error)
    }
  };

  // start the presale
  const startPresale = async() => {

    try {
      // need a signer to start the presale(write to blockchain)
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);

    } catch (error) {
      console.error(error)
    }
  };


  // check if presale ended
  const checkIfPresaleEnded = async() => {
    try {
      const provider = await getProviderOrSigner();

      // get an instance of NFT contract
      // need contract address and contract ABI
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        provider
      );

      // returns BigNumber because presalleEnded is uint256
      // returns a timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      const curretnTimeInSeconds = Date.now() / 1000;
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(curretnTimeInSeconds));
      setPresaleEnded(hasPresaleEnded);
      
    } catch (error) {
      console.error(error);
    }
  };


  // check if presale has already started
  const checkIfPresaleStarted = async() => {
    try {

      const provider = await getProviderOrSigner();

      // get an instance of NFT contract
      // need contract address and contract ABI
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS, 
        NFT_CONTRACT_ABI, 
        provider);

        // call the variable from contract, returns a bool
        const isPresaleStarted = await nftContract.presaleStarted();
        setPresaleStarted(isPresaleStarted);

        return isPresaleStarted;
      
    } catch (error) {
      console.error(error);
      return false;
    }
  };


  const connectWallet = async() => {
    try {
    // call helper function
    await getProviderOrSigner();
    // Update 'walletConnected' to be true
    setWalletConnected(true);
      
    } catch (error) {
      console.error(error)
    }  
  };

  // helper function to get signer or provider
  // signer if need to write, provider if only read from blockchain
  const getProviderOrSigner = async (needSigner = false) => {
    // Access to the provider/signer from Metamask
    // will pop up metamask 
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    //if user isnt connected to goerli tell them to switch to goerlli
    const {chainId} = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch to the Goerli network!");
      throw new Error("Incorrect Network");
    }

    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;

  };

  const onPageLoad = async() => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();

    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
   
  };

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

   
    onPageLoad();
      
    }
  }, [])

  function renderBody() {
    if(!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}> 
        Connect Wallet
      </button>
      );
    }

    if (isOwner && !presaleStarted) {
      //render button to start the presale
    }

    if (!presaleStarted) {
      // pre sale hasnt started yet
    }

    if (presaleStarted && !presaleEnded) {
      // allow users to mint in presale

    }

    if (presaleEnded) {
      // allow public sale mint
    }

  }

  return (
    <div>
      <Head>
        <title>
          Crypto Devs NFT
        </title>
      </Head>


      <div className={styles.main}>


      </div>
    </div>
  )
}
