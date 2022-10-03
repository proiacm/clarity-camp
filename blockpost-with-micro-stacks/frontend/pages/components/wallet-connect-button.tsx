import { useAuth } from '@micro-stacks/react';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const label = isRequestPending ? 'Loading...' : isSignedIn ? 'Sign out' : 'Connect Stacks wallet';
  return (
    <button
      className="p-2 bg-white text-black rounded"
      onClick={() => {
        if (isSignedIn) void signOut();
        else void openAuthRequest();
      }}
    >
      {label}
    </button>
  );
};
