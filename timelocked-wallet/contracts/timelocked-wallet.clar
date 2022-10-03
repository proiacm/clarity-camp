;; timelocked-wallet
;; A time-locked vault contract that becomes eligible to claim by the beneficiary after a certain block-height has been reached.

(impl-trait .locked-wallet-trait.locked-wallet-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-already-locked (err u101))
(define-constant err-unlock-in-past (err u102))
(define-constant err-no-value (err u103))
(define-constant err-beneficiary-only (err u104))
(define-constant err-unlock-height-not-reached (err u105))

(define-data-var beneficiary (optional principal) none)
(define-data-var unlock-height uint u0)

(define-private (contract-address) (as-contract tx-sender))

(define-read-only (get-beneficiary) (var-get beneficiary))

(define-public (lock (new-beneficiary principal) (unlock-at uint) (amount uint))
	(begin
		(asserts! (is-eq tx-sender contract-owner) err-owner-only)
		(asserts! (is-none (var-get beneficiary)) err-already-locked)
		(asserts! (> unlock-at block-height) err-unlock-in-past)
		(asserts! (> amount u0) err-no-value)
		(try! (stx-transfer? amount tx-sender (contract-address)))
		(var-set beneficiary (some new-beneficiary))
		(var-set unlock-height unlock-at)
		(ok true)
	)
)

(define-public (bestow (new-beneficiary principal))
	(begin
		(asserts! (is-eq (some tx-sender) (var-get beneficiary)) err-beneficiary-only)
		(var-set beneficiary (some new-beneficiary))
		(ok true)
	)
)

(define-public (claim (claimer principal))
	(begin
		(asserts! (is-eq (some claimer) (var-get beneficiary)) err-beneficiary-only)
		(asserts! (>= block-height (var-get unlock-height)) err-unlock-height-not-reached)
		(as-contract (stx-transfer? (stx-get-balance tx-sender) tx-sender (unwrap-panic (var-get beneficiary))))
	)
)

;; 1. Lock your funds for a certain amount of time and make a beneficary as well.
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.timelocked-wallet lock 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u10 u2000)

;; 2. Claim funds 
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.timelocked-wallet claim)
;; (err u104) - This is because the beneficiary is not the current tx_sender belongs to someone else

;; 3. Update the tx-sender. You do that with the help of command. 
;; ::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG

;; 4. Let the beneficiary Claim the funds.
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.timelocked-wallet claim )
;; (err u105) - This is because the unlock-height is not reached yet.

;; 5. Advance the chain tip to the unlock-height.
;; ::advance_chain_tip 20

;; 6. Let the beneficiary Claim the funds.
;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.timelocked-wallet claim )

;; ::get_assets_maps
