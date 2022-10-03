import { useNetwork } from '@micro-stacks/react';

export const NetworkToggle = () => {
  const { isMainnet, setNetwork } = useNetwork();
  const networkMode = isMainnet ? 'mainnet' : 'testnet';

  return (
    <button onClick={() => setNetwork(isMainnet ? 'testnet' : 'mainnet')}>{networkMode}</button>
  );
};
