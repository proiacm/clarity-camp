(use-trait locked-wallet-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.locked-wallet-trait.locked-wallet-trait)

(define-public (claim (wallet-contract <locked-wallet-trait>))
  (let
    (
      (beneficiary tx-sender)
    )
    (ok (try! (as-contract (contract-call? wallet-contract claim beneficiary))))
  )
)

;; (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dispatch-call claim 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.timelocked-wallet)
