
;; CONTROL FLOWS
;; =================================================================================================================

;; asserts!

(define-public (asserts-example (input uint))
  (begin
    (asserts! (is-eq input u100) (err "Input does not match u100"))
    (ok "end of the function")
  )
)
;; (contract-call? .controlflows asserts-example u200)


;; =================================================================================================================


;; try!

;; directly run in console
(try! (some u100)) ;; try! unwraps the inner some value

;; Call this function from console
(define-public (try-example (input (response (string-ascii 20) uint)))
  (begin
    (try! input)
    (ok "end of the function")
  )
)
;; (contract-call? .controlflows try-example (ok "Calling try! with ok"))
;; (contract-call? .controlflows try-example (err u200))

;; =================================================================================================================

;; unwrap!

;; directly run in console
(unwrap! (ok u100) (err "unwrap failed"))  ;; unwraps the inner ok response
(unwrap! (some u100) (err "unwrap failed"))  ;; unwraps the inner optional response
;; (unwrap! (err u100) (err "unwrap failed")) ;; unable to unwrap the err response

;; Call this function from console
(define-public (unwrap-example (input (response (string-ascii 20) uint)))
  (begin
    (unwrap! input (err "unwrap failed"))
    (ok "end of the function")
  )
)
;; (contract-call? .controlflows unwrap-example (ok "Calling Unwrap!"))
;; (contract-call? .controlflows unwrap-example (err u100))
;; =================================================================================================================

;; unwrap-panic

;; directly run in console
(unwrap-panic (ok "Hello"))
(unwrap-panic (some "World"))
;; (unwrap-panic (err "World"))

;; call function from console
(define-public (unwrap-panic-example (input (response (string-ascii 30) uint)))
  (begin
    (unwrap-panic input)
    (ok "end of the function")
  )
)
;; (contract-call? .controlflows unwrap-panic-example (ok "Calling Unwrap Panic with ok"))
;; (contract-call? .controlflows unwrap-panic-example (err u200))

;; =================================================================================================================

;; unwrap-err!

;; directly run in console
(unwrap-err! (err "Hello") (err "unwrap failed"))

(define-public (unwrap-err-example (input (response (string-ascii 30) uint)))
  (begin
    (unwrap-err! input (err "unwrap failed"))
    (ok "end of the function")
  )
)
;; (contract-call? .controlflows unwrap-err-example (err u2000))
;; (contract-call? .controlflows unwrap-err-example (ok "Calling Unwrap Panic"))

;; =================================================================================================================

;; unwrap-err-panic!

(define-public (unwrap-err-panic-example (input (response (string-ascii 20) uint)))
  (begin
    (unwrap-err-panic input)
    (ok "end of the function")
  )
)

;; (contract-call? .controlflows unwrap-err-panic-example (err u2000))
;; (contract-call? .controlflows unwrap-err-panic-example (ok "Calling Unwrap Panic"))


;; =================================================================================================================


;; RESPONSE CHECKING

;; (begin
;;     true        ;; this is a boolean, so it is fine.
;;     (err false) ;; this is an *intermediary response*.
;;     (ok true)   ;; this is the response returned by the begin.
;; )

;; =================================================================================================================

;; Functions to allow user to deposit STX and will track individual user deposits

;; (define-map deposits principal uint)

;; (define-read-only (get-total-deposit (who principal))
;;     (default-to u0 (map-get? deposits who))
;; )

;; (define-public (deposit (amount uint))
;;   (begin
;;     (stx-transfer? amount tx-sender (as-contract tx-sender))
;;     (map-set deposits tx-sender (+ (get-total-deposit tx-sender) amount))
;;     (ok true)
;;   )
;; )
