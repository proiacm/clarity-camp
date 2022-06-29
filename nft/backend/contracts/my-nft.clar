
(impl-trait .sip009.sip009)

(define-constant mint-price u1)
(define-constant contract-owner 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

;; SIP requires the asset identifier type to be an unsigned integer
(define-non-fungible-token my-nft uint)

;; The asset identifier should be an incrementing unsigned integer.
;; The easiest way to implement it is to increment a counter variable each time a new NFT is minted.
(define-data-var last-token-id uint u0)

;; retrieve the id of the last minted nft
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; return a link to the nft metadata because example does not have a site, we return none
(define-read-only (get-token-uri (id uint)) 
  (ok none)
)

;; retrieve the owner of a specified NFT id
(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? my-nft id))
)

;; transfer specified NFT from sender to recipient
(define-public (transfer (id uint) (sender principal) (recipient principal))
   (nft-transfer? my-nft id sender recipient)
)

;; mint a new NFT
(define-public (mint (recipient principal))
    (let
        (
          ;; increments the value of last-token-id
          (id (+ (var-get last-token-id) u1))
        )
        ;; transfer stx to contract owner for mint
        (try! (stx-transfer? mint-price recipient contract-owner))
        ;; nft-mint? instantiates the asset and sets the owner to the provided recipient
        (try! (nft-mint? my-nft id recipient))
        ;; set last-token-id to the new incremented value
        (var-set last-token-id id)
        (ok id)
    )
)
