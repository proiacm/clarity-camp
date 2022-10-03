(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token wl uint)

(define-constant ARTIST_ADDRESS 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.wl)
(define-constant MINT_PRICE u35)

(define-data-var last-token-id uint u0)

(define-read-only (get-last-token-id) 
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (id uint)) 
    (ok none)
)

(define-read-only (get-owner (id uint))
    (ok (nft-get-owner? wl id))
)

(define-public (transfer (id uint) (sender principal) (receiver principal))
    (begin 
        (try! (nft-transfer? wl id sender receiver))
        (ok true)
    )
)

(define-public (mint) 
    (let 
        (
             (id (+ (var-get last-token-id) u1))
        )
        (try! (nft-mint? wl id tx-sender))
        (try! (stx-transfer? MINT_PRICE tx-sender ARTIST_ADDRESS))
        (var-set last-token-id id)
        (ok id)
    )
)
