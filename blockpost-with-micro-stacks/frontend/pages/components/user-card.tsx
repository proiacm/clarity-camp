import { useAccount } from '@micro-stacks/react';

export const UserCard = () => {
  const { stxAddress } = useAccount();
  if (!stxAddress)
    return (
      <div className="text-xl">
        <h3>No active session</h3>
      </div>
    );
  return (
    <div className="text-xl">
      <h3>{stxAddress}</h3>
    </div>
  );
};
