
;;examples from Types, Keywords, Storing Data, & Functions

(stx-get-balance 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM) ;;returns the balance of a principal

(len "How long is this string?") ;;returns the length of a string

(map not (list true true false false)) ;;returns a new list with the inverted values of those passed in

(fold + (list u1 u2 u3) u0) ;;sum up elements in a list with an initial value and returns a single value

(len (list 1 2 3)) ;;returns the length of a list

(element-at (list 1 2 3 4) u3) ;;returns the element at a specified index position

(index-of (list 1 2 3 4) 2) ;;returns the index position of a specified element

(get username {id: u5, username: "ciaramaria.btc"}) ;;returns the value of the specified key

(merge {id: u5, username: "ciaramaria.btc" } { language: "Clarity"}) ;; merges two tuples and returns a single tuple

(define-map balances principal uint) ;;defines a map called balances with keys of principal type and corresponding value of uint

(define-public (set-map)
  (ok (map-set balances 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u500)) ;;set map values
)

(define-read-only (get-map)
  (map-get? balances 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5) ;;returns value of specified key
)