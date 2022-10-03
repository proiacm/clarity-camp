import { useCallback, useEffect, useState } from "react";
import { useConnect } from "@stacks/connect-react";
import { StacksMocknet } from "@stacks/network";
import {
  AnchorMode,
  uintCV,
  callReadOnlyFunction,
  makeStandardSTXPostCondition,
  FungibleConditionCode
} from "@stacks/transactions";
import { userSession } from "./ConnectWallet";
import fleekStorage from '@fleekhq/fleek-storage-js'

const Mint = () => {
  const { doContractCall } = useConnect();
  const [minted, setMinted] = useState(false);
  const [src, setSrc] = useState('');

  function mint() {
    const postConditionAddress = userSession.loadUserData().profile.stxAddress.testnet;
    const postConditionCode = FungibleConditionCode.LessEqual;
    const postConditionAmount = 50 * 1000000;
    doContractCall({
      network: new StacksMocknet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      contractName: "another-ape",
      functionName: "mint",
      functionArgs: [],
      postConditions: [
        makeStandardSTXPostCondition(
          postConditionAddress,
          postConditionCode,
          postConditionAmount
        )
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
        console.log("Explorer:", `localhost:8000/txid/${data.txId}?chain=testnet`)
        setMinted(true);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  const getNft = useCallback(async () => {
    if (minted) {
      const options = {
          contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          contractName: "another-ape",
          functionName: "get-token-uri",
          network: new StacksMocknet(),
          functionArgs: [uintCV(1)],
          senderAddress: userSession.loadUserData().profile.stxAddress.testnet
      };

      const result = await callReadOnlyFunction(options);
      console.log(result);
      if (result.value) {
        // using fetch to retrieve data
        // fetch(`https://${result.value.value.data}`)
        // .then(res => res.json())
        // .then ((output) => {
        //   console.log("Metadata:", output)
        //   setSrc(output.image);
        // })
        // using fleek helper to retrieve data
        const myFile = await fleekStorage.getFileFromHash({
          // hash can be passed in via get-token-uri as in fetch example
          hash: 'bafybeigi4zxlzz6wmqrgazeccbenctvhdn5bw7o7qlwfvqo7g5alij4bda'
        })
        console.log("MY FILE", myFile)
        setSrc(myFile.image);
      }
    }
  });
  console.log(src);

  useEffect(() => {
    getNft();
  }, [minted])

  if (!userSession.isUserSignedIn()) {
    return null;
  }

  return (
    <div>
      {!minted &&
        <div>
          <p>Mint Another Ape!</p>
          <button className="Vote" onClick={() => mint()}>
            🐵
          </button>
        </div>  
      }
      {minted && 
        <div>
          <img src={src} alt="another ape" height="500px" width="500px" />
        </div>
      }
    </div>
  ); 
};

export default Mint;