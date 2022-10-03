(impl-trait .traits.ft-trait)

(define-constant ERR_NOT_MINTER (err u200))
(define-constant ERR_AMOUNT_ZERO (err u201))

(define-data-var minter principal tx-sender)

(define-fungible-token lp-token)

(define-read-only (get-name)
  (ok "liquidity-provider-token")
)

(define-read-only (get-symbol)
  (ok "LP-TOKEN")
)

(define-read-only (get-decimals) 
  (ok u6)
)

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance lp-token user))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply lp-token))
)

(define-read-only (get-token-uri)
  (ok none)
)

(define-public (transfer (amount uint) (sender principal) (receiver principal) (memo (optional (buff 34)))) 
  (ok true)
)

(define-public (set-minter (user principal))
  (begin
    (asserts! (is-eq tx-sender (var-get minter)) ERR_NOT_MINTER)
    (ok (var-set minter user))
  )
)

(define-public (mint (amount uint) (user principal))
  (begin
    (asserts! (is-eq tx-sender (var-get minter)) ERR_NOT_MINTER)
    (asserts! (> amount u0) ERR_AMOUNT_ZERO)
    (ft-mint? lp-token amount user)
  )
)

(define-public (burn (amount uint))
  (ft-burn? lp-token amount tx-sender)
)

;; 
