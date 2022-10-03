;; Create a Divider trait using the command: clarinet contract new divider-trait

(define-trait divider
  (
    (divide-2 (uint) (response uint uint))
    (divide-3 (uint) (response uint uint))
  )
)
