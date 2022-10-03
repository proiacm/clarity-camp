;; Another Ape NFT
;; sample SIP-009 implementation

(impl-trait .sip009.sip009)

(define-non-fungible-token another-ape uint)

(define-constant MINT_PRICE u50000000)
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_TOKEN_OWNER (err u101))

(define-data-var last-token-id uint u0)

(define-data-var base-uri (string-ascii 100) "storageapi.fleek.co/87ae85d3-6af5-4525-94fc-620cfc39f293-bucket/nft-example/another_ape.json") ;; ipfs://

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (id uint))
 ;;(concat var-get base-uri "{id}" ".json")
  (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? another-ape id))
)

(define-public (transfer (id uint) (sender principal) (receiver principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    ;; #[filter(id, receiver)]
    (nft-transfer? another-ape id sender receiver)
  )
)

(define-public (mint)
  (let 
    (
      (id (+ (var-get last-token-id) u1))
    )
    (try! (stx-transfer? MINT_PRICE tx-sender CONTRACT_OWNER))
    (try! (nft-mint? another-ape id tx-sender))
    (var-set last-token-id id)
    (ok id)
  )
)