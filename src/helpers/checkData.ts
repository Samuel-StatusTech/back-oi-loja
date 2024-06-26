import { TNewPayment } from "../@types/payments"

type TRes =
  | {
      ok: false
      fields: string[] | "all"
    }
  | { ok: true }

export const checkData = (property: Partial<TNewPayment> | undefined): TRes => {
  let status: TRes = { ok: true }

  const o: any = {
    customer: {
      name: "",
      email: "",
      tax_id: "",
    },
    items: [
      {
        name: "",
        quantity: 0,
        unit_amount: 0,
      },
    ],
    qr_codes: [
      {
        amount: {
          value: 0,
        },
      },
    ],
  } as const

  if (property) {
    Object.entries(o).forEach(([key]) => {
      const value = property[key as keyof TNewPayment]
      switch (key) {
        case "customer":
          if (value && !Array.isArray(value)) {
            if (!value.name || !value.email || !value.tax_id) {
              // @ts-ignore
              status = { ok: false, fields: [...(status.fields ?? []), key] }
            }
          } else {
            // @ts-ignore
            status = { ok: false, fields: [...(status.fields ?? []), key] }
          }
          break
        case "items":
        case "qr_codes":
          if (
            !Array.isArray(value) ||
            (Array.isArray(value) && value.length < 1)
          ) {
            // @ts-ignore
            status = { ok: false, fields: [...(status.fields ?? []), key] }
          }
          break
        default:
          break
      }

      if (value === undefined || typeof value !== typeof o[key]) {
        // @ts-ignore
        status = { ok: false, fields: [...(status.fields ?? []), key] }
      }
    })
  } else {
    status = {
      ok: false,
      fields: "all",
    }
  }

  return status
}
