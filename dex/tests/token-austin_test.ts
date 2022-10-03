
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.32.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Mint austin coin",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("wallet_1")!.address;
    const recipient = accounts.get("wallet_2")!.address;

    // transaction call
    const receipt = chain.mineBlock([
      Tx.contractCall(
        "token-austin",
        "mint",
        [types.uint(200), types.principal(recipient)],
        deployer
      ),
    ]).receipts[0];

    // assert
    receipt.result.expectOk().expectBool(true);
    receipt.events.expectFungibleTokenMintEvent(
      200,
      recipient,
      "austin"
    );
  },
});


Clarinet.test({
  name: "Transfer austin coin",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("wallet_1")!.address;
    const recipient = accounts.get("wallet_2")!.address;

    const receipt = chain.mineBlock([
      // mint
      Tx.contractCall(
        "token-austin",
        "mint",
        [types.uint(200), types.principal(deployer)],
        deployer
      ),
      // transfer
      Tx.contractCall(
        "token-austin",
        "transfer",
        [types.uint(100), types.principal(deployer), types.principal(recipient), types.none()],
        deployer
      ),
    ]).receipts[1];

    // assert
    receipt.result.expectOk().expectBool(true);
    receipt.events.expectFungibleTokenTransferEvent(
      100,
      deployer,
      recipient,
      "austin",
    );
  },
});

Clarinet.test({
  name: "Unauthorized Transfer austin coin",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("wallet_1")!.address;
    const recipient = accounts.get("wallet_2")!.address;

    const receipt = chain.mineBlock([
      // mint
      Tx.contractCall(
        "token-austin",
        "mint",
        [types.uint(200), types.principal(deployer)],
        deployer
      ),
      // transfer
      Tx.contractCall(
        "token-austin",
        "transfer",
        [types.uint(100), types.principal(deployer), types.principal(recipient), types.none()],
        recipient
      ),
    ]).receipts[1];

    // assert
    receipt.result.expectErr().expectUint(2000);
  },
});
