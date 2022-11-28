;; auction
;; NFT Seller can sell NFT to auction

(use-trait nft-token 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; constants 
;;
(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_ADDRESS 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction)
 
;; error constants
;; 
(define-constant ERR_AUCTION_ALREADY_STARTED (err u100))
(define-constant ERR_NOT_SELLER (err u101))
(define-constant ERR_AUCTION_NOT_STARTED (err u102))
(define-constant ERR_AUCTION_ENDED (err u103))
(define-constant ERR_BID_LOWER_THAN_HIGHEST (err u104))
(define-constant ERR_START_BID_LOWER_THAN_ZERO (err u105))
(define-constant ERR_INVALID_ENDS_AT (err u106))
(define-constant ERR_NO_BID_PLACED (err u107))
(define-constant ERR_CANNOT_BID_OWN_NFT (err u108))
(define-constant ERR_CANNOT_WITHDRAW_ON_HIGHEST_BID (err u109))

;; data maps and vars
;;
(define-map Started {nft: principal, nft-id: uint} bool)
(define-map Seller {nft: principal, nft-id: uint} principal)
(define-map EndsAt {nft: principal, nft-id: uint} uint)
(define-map Bids {nft: principal, nft-id: uint, bidder: principal} uint)
(define-map HighestBids {nft: principal, nft-id: uint} {bidder: principal, bid: uint})

;; public functions
;;

;; Seller starts the auction with a starting bid and no. of days to run the auction
(define-public (start (nft <nft-token>) (nft-id uint) (starting-bid uint) (endsAt uint)) 
    (let
        (
            (seller tx-sender)
            (nft-owner (try! (contract-call? nft get-owner nft-id)))
            (nft-contract (contract-of nft));; principal 
        )
        (asserts! (> starting-bid u0) ERR_START_BID_LOWER_THAN_ZERO)
        (asserts! (is-none (map-get? Started { nft: nft-contract, nft-id: nft-id })) ERR_AUCTION_ALREADY_STARTED)
        (asserts! (and (is-some nft-owner) (is-eq (unwrap! nft-owner ERR_NOT_SELLER) tx-sender)) ERR_NOT_SELLER)
        (asserts! (> endsAt block-height) ERR_INVALID_ENDS_AT)

        (map-set Started { nft: nft-contract, nft-id: nft-id } true)
        (map-set EndsAt { nft: nft-contract, nft-id: nft-id } endsAt)
        (map-set HighestBids {nft: nft-contract, nft-id: nft-id} { bidder: tx-sender, bid: starting-bid })
        (map-set Seller {nft: nft-contract, nft-id: nft-id} tx-sender)

        (try! (as-contract (contract-call? nft transfer nft-id seller tx-sender)))
        
        (ok u200)
    )
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction start 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1 u100 u20)

(define-public (bid (nft <nft-token>) (nft-id uint) (amount uint)) 
    (let 
        (
            (nft-contract (contract-of nft))
            (nft-seller (unwrap! (map-get? Seller { nft: nft-contract, nft-id: nft-id }) ERR_AUCTION_NOT_STARTED))
        )
        (asserts! (not (is-eq nft-seller tx-sender)) ERR_CANNOT_BID_OWN_NFT)
        (asserts! (is-some (map-get? Started { nft: nft-contract, nft-id: nft-id })) ERR_AUCTION_NOT_STARTED)
        (asserts! (< block-height (unwrap! (map-get? EndsAt { nft: nft-contract, nft-id: nft-id }) ERR_AUCTION_ENDED) ) ERR_AUCTION_ENDED)
        (asserts! (> amount (get bid (unwrap! (map-get? HighestBids { nft: nft-contract, nft-id: nft-id }) ERR_AUCTION_ENDED))) ERR_BID_LOWER_THAN_HIGHEST)

        (map-set HighestBids {nft: nft-contract, nft-id: nft-id} { bidder: tx-sender, bid: amount })
        (map-set Bids {nft: nft-contract, nft-id: nft-id, bidder: tx-sender} amount)
        (try! (stx-transfer? amount tx-sender CONTRACT_ADDRESS))
        (ok u200)
    )
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction bid 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1 u200)

(define-public (withdraw (nft <nft-token>) (nft-id uint)) 
    (let
        (
            (sender tx-sender)
            (nft-contract (contract-of nft))
            (highest-bidder (unwrap! (map-get? HighestBids {nft: nft-contract, nft-id: nft-id}) ERR_NO_BID_PLACED))
            (bid-placed (unwrap! (map-get? Bids {nft: nft-contract, nft-id: nft-id, bidder: tx-sender}) ERR_NO_BID_PLACED))
        )
        (asserts! (not (is-eq (get bidder highest-bidder) sender)) ERR_CANNOT_WITHDRAW_ON_HIGHEST_BID)

        (try! (as-contract (stx-transfer? bid-placed CONTRACT_ADDRESS sender)))
        (map-delete Bids {nft: nft-contract, nft-id: nft-id, bidder: sender})
        
        (ok true)
    )
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction withdraw 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)

(define-public (end (nft <nft-token>) (nft-id uint)) 
    (let
        (
            (nft-contract (contract-of nft))
            (ends-at (unwrap! (map-get? EndsAt {nft: nft-contract, nft-id: nft-id}) ERR_AUCTION_NOT_STARTED))
            (highest-bidder (unwrap! (map-get? HighestBids {nft: nft-contract, nft-id: nft-id}) ERR_NO_BID_PLACED))
            (nft-seller (unwrap! (map-get? Seller {nft: nft-contract, nft-id: nft-id}) ERR_NO_BID_PLACED))

        )
        (asserts! (<= ends-at block-height) ERR_AUCTION_NOT_STARTED)
        
        (map-set Started { nft:  nft-contract, nft-id: nft-id } false)
        (if (is-eq (get bidder highest-bidder) nft-seller)
            (try! (as-contract (contract-call? nft transfer nft-id CONTRACT_ADDRESS nft-seller)))
            (begin
                (try! (as-contract (contract-call? nft transfer nft-id CONTRACT_ADDRESS (get bidder highest-bidder))))
                (try! (as-contract (stx-transfer? (get bid highest-bidder) CONTRACT_ADDRESS nft-seller)))
            )
        )
        (ok u200)
    )
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction end 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)

;; read-only functions
;; 

(define-read-only (get-bid (nft <nft-token>) (nft-id uint) (bidder principal))
    (map-get? Bids { nft: (contract-of nft), nft-id: nft-id, bidder: bidder })
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction get-bid 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1 tx-sender)

(define-read-only (get-highest-bid (nft <nft-token>) (nft-id uint)) 
    (map-get? HighestBids { nft: (contract-of nft), nft-id: nft-id })
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction get-highest-bid 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)

(define-read-only (is-started (nft <nft-token>) (nft-id uint)) 
    (map-get? Started { nft: (contract-of nft), nft-id: nft-id })
)
;;  (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction is-started 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)

(define-read-only (get-ends-at (nft <nft-token>) (nft-id uint)) 
    (map-get? EndsAt { nft: (contract-of nft), nft-id: nft-id })
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction get-ends-at 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)

(define-read-only (placed-bid (nft <nft-token>) (nft-id uint)) 
    (map-get? Bids { nft: (contract-of nft), nft-id: nft-id, bidder: tx-sender })
)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auction placed-bid 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wl u1)
