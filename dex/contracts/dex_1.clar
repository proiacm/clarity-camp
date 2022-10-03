(use-trait ft-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.traits.ft-trait)

(define-constant CONTRACT_ADDRESS (as-contract tx-sender))
(define-constant FEE_BASIS_POINTS u30) ;; 0.3%

(define-constant ERR_ZERO_STX (err u100))
(define-constant ERR_ZERO_TOKENS (err u101))

;; private functions
(define-private (get-stx-balance)
  (stx-get-balance CONTRACT_ADDRESS)
)

(define-private (get-token-balance (token <ft-trait>))
  (unwrap-panic (contract-call? token get-balance CONTRACT_ADDRESS))
)

(define-private (initial-liquidity (token <ft-trait>) (amount uint) (tokenAmount uint) (provider principal))
    (begin
        (try! (stx-transfer? amount tx-sender CONTRACT_ADDRESS))
        (contract-call? token transfer tokenAmount tx-sender CONTRACT_ADDRESS none)
    )
)

(define-private (additional-liquidity (token <ft-trait>) (amount uint))
    (let
        ( 
            (stxBalance (get-stx-balance))
            (tokenBalance (get-token-balance token))
            (tokensToTransfer (/ (* amount tokenBalance) stxBalance))
        )
        (try! (stx-transfer? amount tx-sender CONTRACT_ADDRESS))
        (contract-call? token transfer tokensToTransfer tx-sender CONTRACT_ADDRESS none)
    )
)

;; public functions
(define-public (provide-liquidity (token <ft-trait>) (amount uint) (maxTokenAmount uint))
  (begin
    (asserts! (> amount u0) ERR_ZERO_STX)
    (asserts! (> maxTokenAmount u0) ERR_ZERO_TOKENS)

    (if (is-eq (get-stx-balance) u0) 
        (initial-liquidity token amount maxTokenAmount tx-sender)
        (additional-liquidity token amount)
    )
  )
)

(define-public (swap-stx-to-token (token <ft-trait>) (stxAmount uint))
    (let 
        (
            (stxBalance (get-stx-balance))
            (tokenBalance (get-token-balance token))
            (rate (* stxBalance tokenBalance))
            (newStxBalance (+ stxBalance stxAmount))
            (newTokenBalance (/ rate newStxBalance))
            (tokensToPay (- tokenBalance newTokenBalance))
            (callerAddress tx-sender)
            (contract-address (as-contract tx-sender))
        )
        (asserts! (> stxAmount u0) ERR_ZERO_TOKENS)

        (try! (stx-transfer? stxAmount callerAddress CONTRACT_ADDRESS))
        (as-contract (contract-call? token transfer tokensToPay CONTRACT_ADDRESS callerAddress none))
    )
)

(define-public (swap-token-to-stx (token <ft-trait>) (tokenAmount uint))
    (let 
        (
            (stxBalance (get-stx-balance))
            (tokenBalance (get-token-balance token))
            (rate (* stxBalance tokenBalance))
            (newTokenBalance (+ tokenBalance tokenAmount))
            (newStxBalance (/ rate newTokenBalance))
            (stxToPay (- stxBalance newStxBalance))
            (callerAddress tx-sender)
        )
        (asserts! (> tokenAmount u0) ERR_ZERO_TOKENS)

        (try! (contract-call? token transfer tokenAmount callerAddress CONTRACT_ADDRESS none))
        (as-contract (stx-transfer? stxToPay CONTRACT_ADDRESS callerAddress))
    )
)

;; Mint some Miami coin token 
;; (contract-call? 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token test-mint u10000 tx-sender)

;; Provide Liquidity (Initial or Additional)
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dex_1 provide-liquidity 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token u5000 u10000)

;; Swaps
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dex_1 swap-stx-to-token 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token u100)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dex_1 swap-token-to-stx 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token u100)
