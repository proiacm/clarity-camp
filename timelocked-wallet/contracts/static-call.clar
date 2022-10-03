(define-public (claim)
    (let
        (
            (beneficiary tx-sender)
            (total-balance (as-contract (stx-get-balance beneficiary)))
            (share (/ total-balance u4))
        )
        (print beneficiary)
        (try! (as-contract (contract-call? .timelocked-wallet claim beneficiary)))
        
        (try! (stx-transfer? share tx-sender 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK))
        (try! (stx-transfer? share tx-sender 'ST20ATRN26N9P05V2F1RHFRV24X8C8M3W54E427B2))
        (try! (stx-transfer? share tx-sender 'ST21HMSJATHZ888PD0S0SSTWP4J61TCRJYEVQ0STB))
        (try! (stx-transfer? (stx-get-balance tx-sender) tx-sender 'ST2QXSK64YQX3CQPC530K79XWQ98XFAM9W3XKEH3N))
        (ok true)
    )
)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.static-call claim)
