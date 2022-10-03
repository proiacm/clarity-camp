
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.1/index.ts';
import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "A user should be able to create a shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for shipper and receiver
    let shipper = accounts.get("wallet_1")!.address
    let receiver = accounts.get("wallet_2")!.address

    // Make a contract call to create a shipment by the shipper
    let block = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii('123 S Main St, Chicago'), types.ascii('123 S Main St, Denver'), types.principal(receiver)],
        shipper
      ),
    ])

    // Fetch the block result from the block mined
    const result = block.receipts[0].result;
    // Verify that block height increased
    assertEquals(block.height, 2)

    // Verify that the result is success and matches unsigned integer 200
    result.expectOk().expectUint(200)

    // Call get-shipment to fetch on-chain data
    const actualShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      receiver
    );

    // Verify that the shipment details match the expected result
    assertStringIncludes(
      actualShipment.result,
      `"123 S Main St, Denver"`
    );
  },
});

Clarinet.test({
  name: "Multiple users should be able to successfully create multiple shipments",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for First shipper and receiver
    const firstShipper = accounts.get("wallet_1")!.address;
    const firstReceiver = accounts.get("wallet_2")!.address;

    // Second Shipment Details
    const secondShipper = accounts.get("wallet_3")!.address;
    const secondReceiver = accounts.get("wallet_4")!.address;

    // Third Shipment Details
    const thirdShipper = accounts.get("wallet_3")!.address;
    const thirdReceiver = accounts.get("wallet_4")!.address;

    // Make 3 contract calls to create a shipments
    let block = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii('123 S Main St, Chicago'), types.ascii('123 S Main St, Denver'), types.principal(firstReceiver)],
        firstShipper
      ),
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii('123 S Main St, Chicago'), types.ascii('123 S Main St, Denver'), types.principal(secondReceiver)],
        secondShipper
      ),
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii('123 S Main St, Chicago'), types.ascii('123 S Main St, Denver'), types.principal(thirdReceiver)],
        thirdShipper
      )
    ]);

    // Verify that block height increased
    assertEquals(block.height, 2)

    // Fetch the result for first transaction
    const firstResult = block.receipts[0].result;
    firstResult.expectOk().expectUint(200)

    // Fetch the result for second transaction
    const secondResult = block.receipts[1].result;
    secondResult.expectOk().expectUint(200);

    // Fetch the result for third transaction
    const thirdResult = block.receipts[2].result;
    thirdResult.expectOk().expectUint(200);

    // Call get-shipment for first shipment id to fetch on-chain data
    const firstShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      firstShipper
    );
    const firstActualShipment = firstShipment.result;
    firstActualShipment.expectOk();

    // Verify that the first shipment details match the expected result
    assertStringIncludes(
      firstActualShipment,
      `${firstReceiver}`
    );

    // Call get-shipment for second shipment id to fetch on-chain data
    const secondShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(2)],
      secondShipper
    );
    const secondActualShipment = secondShipment.result;
    secondActualShipment.expectOk();

    // Verify that the second shipment details match the expected result
    assertStringIncludes(
      secondActualShipment,
      `${secondReceiver}`
    );

    // Call get-shipment for third shipment id to fetch on-chain data
    const thirdShipment = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(3)],
      secondShipper
    );
    const thirdActualShipment = thirdShipment.result;
    thirdActualShipment.expectOk();

    // Verify that the third shipment details match the expected result
    assertStringIncludes(
      thirdActualShipment,
      `${thirdReceiver}`
    );
  },
});

Clarinet.test({
  name: "A user should be able to update their shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for shipper and receiver
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Make a contract call to create a shipment
    const createBlock = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii("Shipping from"), types.ascii("Shipping to"), types.principal(receiver)],
        shipper
      )
    ])

    assertEquals(createBlock.receipts.length, 1);
    // Verify that block height increased
    assertEquals(createBlock.height, 2);

    // Make a contract call to update the created shipment
    const updateBlock = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'update-shipment',
        [types.uint(1), types.ascii("in transit")],
        shipper
      )
    ])

    // Fetch the block result from the block mined
    const result = updateBlock.receipts[0].result
    // Verify that block height increased
    assertEquals(updateBlock.height, 3)

    // Verify that the result is `ok` response
    result.expectOk().expectUint(200)

    // Call get-shipment to fetch on-chain data
    const readTransaction = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      shipper
    );

    const readActualShipment = readTransaction.result;
    // Verify that the result is `ok` response
    readActualShipment.expectOk();

    // Verify that the result includes the updated details of the shipment
    assertStringIncludes(
      readActualShipment,
      `in transit`
    );
  },
});

Clarinet.test({
  name: "A user should not be able to update their shipment if status is invalid",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for shipper and receiver
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Make a contract call to create a shipment
    const createBlock = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii("Shipping from"), types.ascii("Shipping to"), types.principal(receiver)],
        shipper
      )
    ])

    assertEquals(createBlock.receipts.length, 1);
    // Verify that block height increased
    assertEquals(createBlock.height, 2);

    // Make a contract call to update the shipment you created
    const updateBlock = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'update-shipment',
        [types.uint(1), types.ascii("invalid")],
        shipper
      )
    ])

    const result = updateBlock.receipts[0].result;
    // Verify that block height increased
    assertEquals(updateBlock.height, 3)

    // Verify that the result is `err` response with invalid status
    result.expectErr().expectUint(102);

    // Call get-shipment to fetch on-chain data
    const readTransaction = chain.callReadOnlyFn(
      "cargo",
      "get-shipment",
      [types.uint(1)],
      shipper
    );

    const readActualShipment = readTransaction.result;
    readActualShipment.expectOk();

    // Verify that the result does not include the updated status of the shipment
    assertStringIncludes(
      readActualShipment,
      `pending`
    );
  },
});


Clarinet.test({
  name: "A user should not be able to update a shipment which does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for shipper and receiver
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Make a contract call to update a shipment which does not exist
    const block = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'update-shipment',
        [types.uint(1), types.ascii("invalid")],
        shipper
      )
    ])

    // Fetch the block result from the block mined
    const result = block.receipts[0].result

    // Verify the transaction result is an `err` response 104 
    // which means that the shipment does not exist
    result.expectErr().expectUint(104)
  },
});

Clarinet.test({
  name: "A user should not be able to update someone else's shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet addresses for shipper and receiver
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Fetch wallet address for a different shipper
    const different_shipper = accounts.get('wallet_4')!.address

    // Make a contract call to create a shipment
    const block1 = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii("Shipping from"), types.ascii("Shipping to"), types.principal(receiver)],
        shipper
      )
    ])

    // Fetch the block result from the block mined
    assertEquals(block1.receipts.length, 1);
    // Verify that block height increased
    assertEquals(block1.height, 2);

    // Make a contract call to update the created shipment by different shipper
    const block2 = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'update-shipment',
        [types.uint(1), types.ascii("shipped")],
        different_shipper
      )
    ])

    const result = block2.receipts[0].result

    // Verify the transaction result is an `err` response 103
    // which means that another user cannot update the shipment not created by them
    result.expectErr().expectUint(103)
  },
});

Clarinet.test({
  name: "A user should be able to read the current status of a shipment",
  async fn(chain: Chain, accounts: Map<string, Account>) {

    // Fetch wallet address for a different shipper
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Make a contract call to create a shipment
    const block = chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii("Shipping from"), types.ascii("Shipping to"), types.principal(receiver)],
        shipper
      )
    ])

    // Make a read call to the chain to get shipmnet details
    const newShipment = chain.callReadOnlyFn(
      'cargo',
      'get-shipment',
      [types.uint(1)],
      shipper
    )

    const expectedShipment = newShipment.result
    expectedShipment.expectOk()

    // Verify the transaction result is an `ok` response
    assertStringIncludes(expectedShipment, `Shipping from`)
    assertStringIncludes(expectedShipment, `Shipping to`)
    assertStringIncludes(expectedShipment, `${receiver}`)
  },
});

Clarinet.test({
  name: "A user should be not able to read the current status of a shipment, if the shipment id does not exist",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const shipper = accounts.get('wallet_1')!.address
    const receiver = accounts.get('wallet_2')!.address

    // Make a contract call to create a shipment
    chain.mineBlock([
      Tx.contractCall(
        'cargo',
        'create-shipment',
        [types.ascii("Shipping from"), types.ascii("Shipping to"), types.principal(receiver)],
        shipper
      )
    ])

    // Make a read call to the chain to get shipmnet details
    const newShipment = chain.callReadOnlyFn(
      'cargo',
      'get-shipment',
      [types.uint(7)],
      shipper
    )

    // Verify the transaction result is an `err` response 104
    // which means that another user cannot update the shipment not created by them
    const expectedShipment = newShipment.result
    expectedShipment.expectErr().expectUint(104)
  },
});


