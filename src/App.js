import ApolloAstronautsNFT from "./utils/ApolloAstronautsNFT.json";
import { ethers } from "ethers";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import "./styles/App.css";

// Constants
const TWITTER_HANDLE = "itsakeller";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/apolloastronautsnft-fvtrg35ed2";
const TOTAL_MINT_COUNT = 32;

// const CONTRACT_ADDRESS = "0xe5DBAc46DD2918d9423a35f345250Aa516d5144A";
// const CONTRACT_ADDRESS = "0xC7D0655181Ba70E9bcc013f5BC4f106C3D1715Cf";
// const CONTRACT_ADDRESS = "0x447D9953d00778D48dbcC4c85b48A1C9ce59AaD7";
// const CONTRACT_ADDRESS = "0x801a0EecAFFE22c4F556B565A1399C580f36dD22";
const CONTRACT_ADDRESS = "0x53d2d392b187AEeeF474a974Cb604B2931b1482F";

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftsMinted, setNftsMinted] = useState(null);

  /*
   * Gotta make sure this is async.
   */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    await checkChain(ethereum);

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
      getTotalNFTsMintedSoFar();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
      getTotalNFTsMintedSoFar();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          ApolloAstronautsNFT.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function getTotalNFTsMintedSoFar() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          ApolloAstronautsNFT.abi,
          signer
        );

        let tokensMinted = await connectedContract.getTotalNFTsMintedSoFar();
        setNftsMinted(tokensMinted.toString());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          ApolloAstronautsNFT.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );

        getTotalNFTsMintedSoFar();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function checkChain(ethereum) {
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Apollo Astronauts</p>
          <p className="sub-text">Mint one of only 32 Apollo astronauts.</p>
          <div className="button-container">
            {currentAccount === "" ? (
              <button
                onClick={connectWallet}
                className="cta-button connect-wallet-button"
              >
                Connect to Wallet
              </button>
            ) : (
              <button
                onClick={askContractToMintNft}
                className="cta-button connect-wallet-button"
              >
                Mint NFT{" "}
                {nftsMinted && (
                  <span>
                    ({nftsMinted} / {TOTAL_MINT_COUNT} minted)
                  </span>
                )}
              </button>
            )}
            <a
              href={OPENSEA_LINK}
              target="_blank"
              rel="noopener noreferer"
              className="cta-button connect-wallet-button opensea-button"
            >
              View Collection on OpenSea
            </a>
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
