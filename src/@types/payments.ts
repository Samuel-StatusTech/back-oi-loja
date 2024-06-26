export type TNewPayment = {
  customer: {
    name: string
    email: string
    tax_id: string
  }
  items: [
    {
      name: string
      quantity: number
      unit_amount: number
    }
  ]
  qr_codes: [
    {
      amount: {
        value: number
      }
    }
  ]
}
