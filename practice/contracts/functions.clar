
(define-constant contract-owner 'ST20ATRN26N9P05V2F1RHFRV24X8C8M3W54E427B2)

(define-constant err-invalid-caller (err u1))

(define-map recipients principal uint)

(define-private (is-valid-caller)
    (is-eq contract-owner tx-sender)
)

(define-public (add-recipient (recipient principal) (amount uint))
    (if (is-valid-caller)
        (ok (map-set recipients recipient amount))
        err-invalid-caller
    )
)

(define-public (delete-recipient (recipient principal))
    (if (is-valid-caller)
        (ok (map-delete recipients recipient))
        err-invalid-caller
    )
)

(define-read-only (get-recipient (recipient principal))
    (map-get? recipients recipient)
)

;; (contract-call? .functions add-recipient 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0 u10)

;; (contract-call? .functions add-recipient 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u20)

;; (contract-call? .functions get-recipient 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)

;; (contract-call? .functions get-recipient 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)

;; (contract-call? .functions delete-recipient 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)

;; (contract-call? .functions get-recipient 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)

;; (contract-call? .functions get-recipient 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0)

