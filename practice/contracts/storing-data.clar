
;; constants 
(define-constant CONTRACT_DEPLOYER tx-sender)

(define-constant CONTRACT_OWNER (as-contract tx-sender))

(define-constant ERR_INVALID_OWNER (err u100))

(define-constant MINT_COUNT u2000)

;; data vars

;; uint
(define-data-var counter uint u0)

;; string
(define-data-var name (string-utf8 20) u"Hello World")

;; list
(define-data-var listing (list 20 uint) (list u0 u2 u4))

;; optionals
(define-data-var listing1 (optional (list 20 uint)) none)

;; response
(define-data-var responses (response bool (string-ascii 20)) (err "This is an error"))

;; data var set
(var-set listing (list u30 u40))

;; data var get
(var-get responses)

;; defin a map
(define-map Listings uint {
   token: principal,
   sender: principal,
   amount: uint,
   price: uint
})

;; map-set
(define-public (update-map (key uint))
   (ok (map-set Listings key {
           token: tx-sender,
           sender: tx-sender,
           amount: u20000,
           price: u20
       })
   )
)

;; met-get?
(define-read-only (read-from-map (key uint))
   (map-get? Listings key)
)

;; map-delete
(define-public (delete-from-map (key uint))
   (ok (map-delete Listings key))
)

;; map-insert
(define-public (insert-into-map (key uint))
   (ok (map-insert Listings key {
           token: tx-sender,
           sender: tx-sender,
           amount: u20001,
           price: u21
       })
   )
)
