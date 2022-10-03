;; CONSTANTS
;; contract owner
(define-constant CONTRACT-OWNER tx-sender)
;; possible statuses for a shipment
(define-constant STATUS (list "pending" "in transit" "shipped"))

;; ERROR CONSTANTS
;; @response for success
(define-constant SUCCESS u200)
;; @err for invalid ship from 
(define-constant ERR-INVALID-SHIP_FROM u100)
;; @err for invalid ship to
(define-constant ERR-INVALID-SHIP_TO u101)
;; @err fo passing invalid status
(define-constant ERR-INVALID-STATUS u102)
;; @err invalid user trying to update some else's shipment
(define-constant ERR-UNAUTHORIZED-USER u103)
;; @err shipment you are trying to find does not exist
(define-constant ERR-SHIPMENT-DOES-NOT-EXIST u104)

;; DATA VARIABLES
;; @data-variable - unique identifier for the shipment
(define-data-var last-shipment-id uint u0)
;; @map shipments -  storing the shipments
;; @id - unique identifier for the shipment
;; @value - tuple storing the shipment properties
(define-map shipments uint {
    start-location: (string-ascii 25), 
    destination: (string-ascii 25), 
    shipper: principal,
    receiver: principal,
    status: (string-ascii 10)
  }
)

;; FUNCTIONS

;; @function create-shipment - creates a shipment with properties
;; @param ship-from - start-location for the shipment
;; @params ship-to - destination where the shipment is supposed to be shipped
;; @param receiver - principal who is receving the shipment
;; @returns `ok` with u200 response if the shipment is successfuly created 
;; or `err` with u200 response if any of the validations fail
(define-public (create-shipment (ship-from (string-ascii 25)) (ship-to (string-ascii 25)) (receiver principal))
  (let
    (
      (new-shipment-id (+ (var-get last-shipment-id) u1))
    )

    ;; #[filter(ship-from, ship-to, receiver)]
    (map-set shipments new-shipment-id {
        start-location: ship-from, 
        destination: ship-to, 
        shipper: tx-sender,
        receiver: receiver,
        status: "pending"
      }
    )
    (var-set last-shipment-id new-shipment-id)
    (ok SUCCESS)
  )
)

;; @function update-shipment - update a shipment with properties
;; @param shipment-id - unique identifier for the shipment you want to update
;; @param status - status update on the shipment
;; @validates shipent exists for the shipment id provided is not empty
;; @validates that the user who is calling the function is only able to update their own shipment
;; @returns `ok` if the shipment is successfuly updated or `err` if any of the validations fail
(define-public (update-shipment (shipment-id uint) (status (string-ascii 10)))
  (let
    (
      (existing-shipment (unwrap! (map-get? shipments shipment-id) (err ERR-SHIPMENT-DOES-NOT-EXIST)))
      (shipper (get shipper existing-shipment ))
      (new-shipment-info (merge existing-shipment {status: status} ))
    )
    
    (print (index-of STATUS status))

    (asserts! (is-some (index-of STATUS status)) (err ERR-INVALID-STATUS))
    (asserts! (is-eq shipper tx-sender) (err ERR-UNAUTHORIZED-USER))

    ;; #[filter(shipment-id)]
    (map-set shipments shipment-id new-shipment-info)
    (ok SUCCESS)
  )
)

;; @function get-shipment - to fetch shipment details
;; @param shipment-id - unique identifier to fetch the details of shipment
;; @returns `ok` response with shipment details or `err` if there does not exist a shipment id
(define-read-only (get-shipment (shipment-id uint))
    (ok (unwrap! (map-get? shipments shipment-id) (err ERR-SHIPMENT-DOES-NOT-EXIST)))
)
