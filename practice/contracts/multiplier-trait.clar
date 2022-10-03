;; Create a Multiple trait using the command: clarinet contract new multiplier-trait

(define-trait multiplier
  (
    (multiply-2 (uint uint) (response uint uint))
    (multiply-3 (uint uint uint) (response uint uint))
  )
)
