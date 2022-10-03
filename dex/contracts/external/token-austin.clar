(impl-trait .traits.ft-trait)

;; constants
;;
(define-constant CONTRACT_OWNER tx-sender)

;; errors
;;
(define-constant ERR_UNAUTHORIZED u2000)
(define-constant ERR_TOKEN_NOT_ACTIVATED u2001)
(define-constant ERR_TOKEN_ALREADY_ACTIVATED u2002)

;; data maps and vars
;;
(define-data-var tokenUri (optional (string-utf8 256)) none)

(define-fungible-token austin)

;; private functions
;;
(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result
               err-value (err err-value)
  )
)

(define-private (send-token (recipient { to: principal, amount: uint, memo: (optional (buff 34)) }))
  (send-token-with-memo (get amount recipient) (get to recipient) (get memo recipient))
)

(define-private (send-token-with-memo (amount uint) (to principal) (memo (optional (buff 34))))
  (ok (try! (transfer amount tx-sender to memo)))
)

;; public functions
;;
;; mint new tokens, only accessible by a Code Deployer
(define-public (mint (amount uint) (recipient principal))
  ;; #[filter(amount, recipient)]
  (ft-mint? austin amount recipient)
)

;; send many tokens to recipients
(define-public (send-many (recipients (list 200 { to: principal, amount: uint, memo: (optional (buff 34)) })))
  (fold check-err
    (map send-token recipients)
    (ok true)
  )
)

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq from tx-sender) (err ERR_UNAUTHORIZED))
    (if (is-some memo)
      (print memo)
      none
    )
    ;; #[filter(amount, from, to)]
    (ft-transfer? austin amount from to)
  )
)

(define-public (set-token-uri (uri (string-utf8 256)))
  ;; #[filter(uri)]
  (ok (var-set tokenUri (some uri)))
)

;; read-only functions
;;
(define-read-only (get-name)
  (ok "austin")
)

(define-read-only (get-symbol)
  (ok "ATX")
)

(define-read-only (get-decimals)
  (ok u0)
)

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance austin user))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply austin))
)

(define-read-only (get-token-uri)
  (ok (var-get tokenUri))
)
