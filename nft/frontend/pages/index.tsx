import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
    AppConfig,
    UserSession,
    showConnect,
    openContractCall,
} from "@stacks/connect";
import {
    uintCV,
    stringUtf8CV,
    standardPrincipalCV,
    hexToCV,
    cvToHex,
    bufferCVFromString,
    makeStandardSTXPostCondition,
    FungibleConditionCode,
    callReadOnlyFunction
} from "@stacks/transactions";
import { StacksMocknet, StacksTestnet } from "@stacks/network";


export default function Home() {
  // initializing the auth configuration by telling connect that we need the publish_data permissions scope.
  // allow us to actually publish data and interact with the app.
  const appConfig = new AppConfig(["publish_data"]);
  const userSession = new UserSession({ appConfig });

  const [price, setPrice] = useState(1);
  const [userData, setUserData] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  // Set up the network
  const network = new StacksMocknet();

  const [myNftContractAddress, setMyNftContractAddress] = useState(
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  );
  const [myNftContractName, setMyNftContractName] = useState("my-nft");
  const [error, setError] = useState("");

  const handleMint = async () => {
    const userAddress = userSession.loadUserData().profile.stxAddress.testnet;

    const functionArgs = [standardPrincipalCV(userAddress)];
    const postConditionAddress = userAddress;
    const postConditionCode = FungibleConditionCode.LessEqual;
    const postConditionAmount = price * 1000000;
    const postConditions = [
      makeStandardSTXPostCondition(
          postConditionAddress,
          postConditionCode,
          postConditionAmount
      ),
    ];

    const options = {
        contractAddress: myNftContractAddress,
        contractName: myNftContractName,
        functionName: "mint",
        functionArgs,
        network,
        postConditions,
        appDetails: {
            name: "my-nft",
            icon: window.location.origin + "/vercel.svg",
        },
        // onFinish callback triggered after successful tx broadcast
        onFinish: (data) => {
            console.log("Stacks Transaction:", data.stacksTransaction);
            console.log("Transaction ID:", data.txId);
            console.log("Raw transaction:", data.txRaw);
            const explorerTransactionUrl = `https://explorer.stacks.co/txid/${data.txId}`;
            console.log("View transaction in explorer:", explorerTransactionUrl);
        },
    };

    await openContractCall(options);
  };

  const handleGetLastToken = async () => {
    const userAddress = userSession.loadUserData().profile.stxAddress.testnet;

    const contractAddress = myNftContractAddress;
    const contractName = myNftContractName;
    const functionName = "get-last-token-id";
    const myNetwork = network;
    const senderAddress = userAddress;

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [],
      myNetwork,
      senderAddress,
    };
    console.log("OPTIONS", options)
    const result = await callReadOnlyFunction(options);
    console.log("GET LAST TOKEN", result)
  }

  function authenticate() {
    // here we call the showConnect function which will trigger the Hiro wallet to show the connect window.
    // the wallet will take care of the authentication functionality from there.
    showConnect({
      appDetails: {
        name: "My-NFT",
        icon: "https://assets.website-files.com/618b0aafa4afde65f2fe38fe/618b0aafa4afde2ae1fe3a1f_icon-isotipo.svg",
      },
      redirectTo: "/",
      // after the wallet has completed authentication, it will run the onFinish function
      // we add any post-authentication work here. In this case, we are reloading the page so that our app knows a user is signed in
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });    
  }

  useEffect(() => {
    console.log(userSession)
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setLoggedIn(true);
      setUserData(userSession.loadUserData());
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>My-NFT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="flex flex-col w-full items-center justify-center">
          <h1 className="text-6xl font-bold mb-4">My-NFT</h1>
          {loggedIn ? (
          <>
            <button
              onClick={() => handleMint()}
              className="px-10 py-4 bg-green-500 text-2xl text-white mt-24 rounded"
            >
              Mint
            </button>
            <button
              onClick={() => handleGetLastToken()}
              className="px-6 py-2 bg-blue-500 text-xl text-white mt-24 rounded"
            >
              Get last token id
            </button>
          </>
          ) : (
            <button
              className="bg-white-500 hover:bg-gray-300 border-black border-2 font-bold py-2 px-4 rounded mt-16"
              onClick={() => authenticate()}
            >
              Connect to Wallet
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

