
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { assertEquals, assertNotEquals, assertStringIncludes } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "A user who holds the nft asset can start an auction: sets new block height of input days and nft is transferred to contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            )
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        // check that auction is started
        const auctionStarted = chain.callReadOnlyFn(
            "auction",
            "is-started",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertEquals(auctionStarted.result, types.some(types.bool(true)));

        // check that end block is set on auction
        const auctionEndsAt = chain.callReadOnlyFn(
            "auction",
            "get-ends-at",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertEquals(auctionEndsAt.result, types.some("u10"));

        // check that when you start the highest bid is placed by the auctioneer
        const auctionHighestBid = chain.callReadOnlyFn(
            "auction",
            "get-highest-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertStringIncludes(auctionHighestBid.result, "(some {bid: u100, bidder: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5})");

        // check that the nft is transferred to the auction contract
        const auctionNftOwner = chain.callReadOnlyFn(
            "wl",
            "get-owner",
            [types.uint(1)],
            auctioneer
        )
        assertEquals(auctionNftOwner.result, types.ok(types.some(deployer.concat(".auction"))));
    },
});

Clarinet.test({
    name: "A user cannot start auction, with starting bid as u0",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(0), types.uint(10)],
                auctioneer
            )
        ]);
        
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        block.receipts[1].result.expectErr().expectUint(105)

        // check that auction is not started
        const auctionStarted = chain.callReadOnlyFn(
            "auction",
            "is-started",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )

        assertEquals(auctionStarted.result, types.none());
    },
});

Clarinet.test({
    name: "A user cannot start auction, with auction days 0",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(0)],
                auctioneer
            )
        ]);
        
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        block.receipts[1].result.expectErr().expectUint(106)

        // check that auction is not started
        const auctionStarted = chain.callReadOnlyFn(
            "auction",
            "is-started",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )

        assertEquals(auctionStarted.result, types.none());
    },
});

Clarinet.test({
    name: "A user cannot start auction again, if its already started",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            )
        ]);
        
        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[1].result.expectOk();

        block.receipts[2].result.expectErr();

        // check that auction is started
        const auctionStarted = chain.callReadOnlyFn(
            "auction",
            "is-started",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )

        assertEquals(auctionStarted.result, types.some(types.bool(true)));
    },
});

Clarinet.test({
    name: "A user cannot start auction, for someone who is not the owner for the nft id provided",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(2), types.uint(100), types.uint(10)],
                auctioneer
            )
        ]);
        
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        block.receipts[1].result.expectErr();

        // check that auction is started
        const auctionStarted = chain.callReadOnlyFn(
            "auction",
            "is-started",
            [types.principal(deployer.concat(".wl")), types.uint(2)],
            auctioneer
        )

        assertEquals(auctionStarted.result, types.none());
    },
});

Clarinet.test({
    name: "User can place bid for nft in auction successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            )
        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        // check that the highest bid is 110 and highest bidder is bidder1
        const auctionHighestBid = chain.callReadOnlyFn(
            "auction",
            "get-highest-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertStringIncludes(auctionHighestBid.result, `(some {bid: u110, bidder: ${bidder1}})`);
        
        // check that the bid is transferred to the contract
        assertEquals(block.receipts[2].events[0].type, "stx_transfer_event")
        
    },
});

Clarinet.test({
    name: "User can cannot place bid if there is no auction started for it",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            )
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        block.receipts[1].result.expectErr().expectUint(102);
    },
});

Clarinet.test({
    name: "Auctioneer cannot place bid for nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                auctioneer
            )
        ]);
        assertEquals(block.receipts.length, 3);
        assertEquals(block.height, 2);

        block.receipts[2].result.expectErr().expectUint(108);
    },
});

Clarinet.test({
    name: "User cannot place bid for a lower bid than the current highest bid",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address
        const bidder2 = accounts.get('wallet_3')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(105)],
                bidder2
            )
        ]);
        assertEquals(block.receipts.length, 4);
        assertEquals(block.height, 2);

        block.receipts[2].result.expectOk();

        block.receipts[3].result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "User cannot place bid for an auction which has ended",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address

        let block1 = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
        ]);
        assertEquals(block1.receipts.length, 2);
        assertEquals(block1.height, 2);

        chain.mineEmptyBlockUntil(1441)

        let block2 = chain.mineBlock([
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            )
        ]);
        assertEquals(block2.receipts.length, 1);
        assertEquals(block2.height, 1442);

        block2.receipts[0].result.expectErr().expectUint(103);
    },
});

Clarinet.test({
    name: "Checking logic: User can place bid for an auction which is ending in the next block",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address

        let block1 = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
        ]);
        assertEquals(block1.receipts.length, 2);
        assertEquals(block1.height, 2);

        let block3 = chain.mineBlock([
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            )
        ]);
        chain.mineEmptyBlockUntil(9)

        let block2 = chain.mineBlock([
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(120)],
                bidder1
            )
        ]);
        assertEquals(block2.receipts.length, 1);
        assertEquals(block2.height, 10);

        block2.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "User can withdraw from the auction if not the highest bidder",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address
        const bidder2 = accounts.get('wallet_3')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(120)],
                bidder2
            ),
            Tx.contractCall(
                "auction",
                "withdraw",
                [types.principal(deployer.concat(".wl")), types.uint(1)],
                bidder1
            )
        ]);
        assertEquals(block.receipts.length, 5);
        assertEquals(block.height, 2);

        block.receipts[4].result.expectOk();

        // check that the highest bid is 120 and highest bidder is bidder2
        const auctionHighestBid = chain.callReadOnlyFn(
            "auction",
            "get-highest-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertStringIncludes(auctionHighestBid.result, `(some {bid: u120, bidder: ${bidder2}})`);

        // check that the highest bid is 120 and highest bidder is bidder2
        const bidder1Bid = chain.callReadOnlyFn(
            "auction",
            "get-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1), types.principal(bidder1)],
            bidder1
        )
        assertEquals(bidder1Bid.result, `none`);

        assertEquals(block.receipts[4].events[0].type, "stx_transfer_event")
    },
});

Clarinet.test({
    name: "User cannot withdraw from the auction if the highest bidder",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            ),
            Tx.contractCall(
                "auction",
                "withdraw",
                [types.principal(deployer.concat(".wl")), types.uint(1)],
                bidder1
            )
        ]);
        assertEquals(block.receipts.length, 4);
        assertEquals(block.height, 2);

        block.receipts[3].result.expectErr().expectUint(109);

        // check that the highest bid is 120 and highest bidder is bidder2
        const auctionHighestBid = chain.callReadOnlyFn(
            "auction",
            "get-highest-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1)],
            auctioneer
        )
        assertStringIncludes(auctionHighestBid.result, `(some {bid: u110, bidder: ${bidder1}})`);

        // check that the highest bid is 120 and highest bidder is bidder2
        const bidder1Bid = chain.callReadOnlyFn(
            "auction",
            "get-bid",
            [types.principal(deployer.concat(".wl")), types.uint(1), types.principal(bidder1)],
            bidder1
        )
        assertNotEquals(bidder1Bid.result, `none`);
    },
});

Clarinet.test({
    name: "Auction ends: the highest bidder wins",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address
        const bidder2 = accounts.get('wallet_3')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(110)],
                bidder1
            ),
            Tx.contractCall(
                "auction",
                "bid",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(120)],
                bidder2
            ),
        ]);
        assertEquals(block.receipts.length, 4);
        assertEquals(block.height, 2);

        chain.mineEmptyBlockUntil(1445)

        let block3 = chain.mineBlock([
            Tx.contractCall(
                "auction",
                "end",
                [types.principal(deployer.concat(".wl")), types.uint(1)],
                auctioneer
            )
        ]);

        block3.receipts[0].result.expectOk();

        assertEquals(block3.receipts[0].events[0].type, "nft_transfer_event");
        assertEquals(block3.receipts[0].events[1].type, "stx_transfer_event");
    },
});

Clarinet.test({
    name: "Auction ends: there is not bidder, the auctioneer gets its nft back",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const deployer = accounts.get('deployer')!.address;
        const auctioneer = accounts.get('wallet_1')!.address
        const bidder1 = accounts.get('wallet_2')!.address
        const bidder2 = accounts.get('wallet_3')!.address

        let block = chain.mineBlock([
            Tx.contractCall(
                "wl",
                "mint",
                [],
                auctioneer
            ),
            Tx.contractCall(
                "auction",
                "start",
                [types.principal(deployer.concat(".wl")), types.uint(1), types.uint(100), types.uint(10)],
                auctioneer
            ),
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 2);

        chain.mineEmptyBlockUntil(1445)

        let block3 = chain.mineBlock([
            Tx.contractCall(
                "auction",
                "end",
                [types.principal(deployer.concat(".wl")), types.uint(1)],
                auctioneer
            )
        ]);

        block3.receipts[0].result.expectOk();

        assertEquals(block3.receipts[0].events[0].type, "nft_transfer_event");
    },
});
