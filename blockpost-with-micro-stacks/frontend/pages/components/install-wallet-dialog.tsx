import { useAppDetails } from '@micro-stacks/react';
import { getBrowser, getWalletInstallUrl } from 'micro-stacks/connect';

interface InstallWalletDialogProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const InstallWalletDialog = ({ isOpen, onClose }: InstallWalletDialogProps) => {
  const { appName } = useAppDetails();
  const browser = getBrowser();
  const installUrl = getWalletInstallUrl(browser);

  if (!isOpen) return null;

  return (
    <dialog open>
      <h2>No wallet found!</h2>
      <p>
        You’ll need a wallet to use {appName ?? 'this app'}. A wallet gives you access Stacks apps,
        your account, and your NFTs.
      </p>
      <p>
        <a
          href={installUrl}
          target="_blank"
        >
          {browser === 'Mobile'
            ? 'Download Xverse, the mobile wallet for Stacks'
            : `Install the Hiro Web Wallet, a web extension`}
        </a>
      </p>
      <form
        method="dialog"
        onSubmit={() => {
          onClose();
        }}
      >
        <button>Dismiss</button>
      </form>
    </dialog>
  );
};
