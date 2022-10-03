import type { NextPage, GetServerSidePropsContext } from 'next';

import { useState, useCallback, SetStateAction, useEffect } from 'react';
import * as MicroStacks from '@micro-stacks/react';
import { WalletConnectButton } from './components/wallet-connect-button';
import { UserCard } from './components/user-card';

import {
  stringUtf8CV,
  standardPrincipalCV
} from 'micro-stacks/clarity';
import { FungibleConditionCode, makeStandardSTXPostCondition, callReadOnlyFunction } from 'micro-stacks/transactions';
import { useOpenContractCall } from '@micro-stacks/react';
import { useAuth } from '@micro-stacks/react';
import { StacksMocknet } from "micro-stacks/network";
import useInterval from "@use-it/interval";

import { getDehydratedStateFromSession } from '../common/session-helpers';

// export async function getServerSideProps(ctx: GetServerSidePropsContext) {
//   return {
//     props: {
//       dehydratedState: await getDehydratedStateFromSession(ctx),
//     },
//   };
// }

const Home: NextPage = () => {

  const { openContractCall, isRequestPending } = useOpenContractCall();
  const { stxAddress } = MicroStacks.useAccount();
  const [response, setResponse] = useState(null);
  const { openAuthRequest, signOut, isSignedIn } = useAuth();
  const [post, setPost] = useState('');
  const [postedMessage, setPostedMessage] = useState("none");
  const [contractAddress, setContractAddress] = useState("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")

  // user input handler
  const handleMessageChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setPost(e.target.value);
  }
 
  // handle contract call to write-post
  const handleOpenContractCall = async () => {
    const functionArgs = [
      stringUtf8CV(post),
    ];

    const postConditions = [
      makeStandardSTXPostCondition(stxAddress!, FungibleConditionCode.LessEqual, '1000000'),
    ];
 
    await openContractCall({
      contractAddress: contractAddress,
      contractName: 'blockpost',
      functionName: 'write-post',
      functionArgs,
      postConditions,
      attachment: 'This is an attachment',
      onFinish: async data => {
        console.log('finished contract call!', data);
        setResponse(data);
      },
      onCancel: () => {
        console.log('popup closed!');
      },
    });
  };

  // handle contract call to get-post
  const getPost = useCallback(async () => {

    if (isSignedIn) {
      // args for function being called
      const functionArgs = [
        standardPrincipalCV(`${stxAddress}`)
      ]
      // network param for callReadOnly
      const network = new StacksMocknet();
      // read only function call
      const result = await callReadOnlyFunction({
        contractAddress: contractAddress,
        contractName: 'blockpost',
        functionName: 'get-post',
        functionArgs,
        network
      });
      console.log("getting result", result);
      if (result.value) {
        setPostedMessage(result.value.data)
      }
    }
  }, []);

  // run get post on sign in to get message
  useEffect(() => {
    console.log("In useEffect")
    getPost()
  }, [isSignedIn])

  // check the Stacks API every 10 seconds looking for changes
  useInterval(getPost, 10000);

  return (
    <>
      <div className="flex flex-row gap-12 items-center justify-center py-4">
        <UserCard />
        <WalletConnectButton />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
          {isSignedIn &&
            <form 
            className="flex flex-col items-center justify-center text-2xl"
            onSubmit={() => handleOpenContractCall()}>
              <p>
                Post &nbsp;
                <input
                  className="bg-white text-black placeholder:text-slate-500"
                  type="text"
                  value={post}
                  onChange={handleMessageChange}
                  placeholder="something"
                />
                &nbsp; for 1 STX
              </p>
              <button
                type="submit"
                className="px-10 py-4 bg-white text-black mt-12 rounded"
              >
                {isRequestPending ? 'request pending...' : 'Write post'}
              </button>
              <div className="mt-28">
                {postedMessage !== "none" ? (
                    <p>You posted &quot;{postedMessage}&quot;</p>
                ) : (
                    <p>You have not posted anything yet. <span role="img" aria-label="woman_shrugging">🤷🏻‍♀️</span></p>
                )}
            </div>
            </form>
          }
      </div>
    </>
  )
}

export default Home
