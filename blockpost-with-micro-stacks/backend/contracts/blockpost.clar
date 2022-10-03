
;; Blockpost
;; contract that writes a post on chain for a small fee

(define-constant contract-owner tx-sender)

(define-constant price u1000000)

(define-data-var total-posts uint u0)

(define-map posts principal (string-utf8 500))

(define-read-only (get-total-posts)
  (var-get total-posts)
)

(define-read-only (get-post (user principal))
  (map-get? posts user)
)

(define-public (write-post (message (string-utf8 500)))
  (begin
    (try! (stx-transfer? price tx-sender contract-owner))
    ;; #[allow(unchecked_data)]
    (map-set posts tx-sender message)
    (var-set total-posts (+ (var-get total-posts) u1))
    (ok "SUCCESS")
  )
)