
;; blockpost
;; contract that writes a post to the chain for a small STX fee

;; constants
;; wallet that will receive the fees paid to post (taken from Devnet.toml)
(define-constant receiver-address 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-constant price u1)

;; data maps and vars
;; store the total number of posts
(define-data-var total-posts uint u0)
;; store a map of each post (this will add a new post to our map with the tx-sender as the key and the post with a max of 500 characters as the value)
(define-map posts principal (string-utf8 500))

;; private functions

;; public functions
;; get the total-posts
(define-read-only (get-total-posts)
  (var-get total-posts)
)
;; get the post mapped to the current user
(define-read-only (get-post (user principal))
  (map-get? posts user)
)

;; write post to blockchain and collect fee
(define-public (write-post (message (string-utf8 500)))
  (begin
    ;; try attempts to unwrap the value of stx-transfer (either OK or ERR), if successful it will extract that value that return it, otherwise it will exit the function
     (try! (stx-transfer? price tx-sender receiver-address))
    ;; will set the map values to key of tx-sender and value of the post
    ;; the check checker will give us a warning about unchecked data 
    ;; #[allow(unchecked_data)]
    (map-set posts tx-sender message)
    ;; sets the total-posts var to the current value plus 1
    (var-set total-posts (+ (var-get total-posts) u1))
    ;; public functions must return a response
    (ok "Post successful")
  )
)

