import { Request, Response } from "express"
import axios, { AxiosError } from "axios"
import { checkData } from "../helpers/checkData"
import dotenv from "dotenv"
import { io } from "../app"
import { getMessage } from "../helpers/getMessage"

dotenv.config()

axios.defaults.headers.Authorization = process.env.pbToken as string
const pbUrl = process.env.pbUrl as string

const fiveMinutes = 5 * 60 * 1000

const splits = {
  method: "FIXED",
  receivers: [
    // master
    {
      account: {
        id: "ACCO_84992854-BA78-488E-A091-A3731D5BC242",
      },
      amount: {
        value: 700,
      },
    },
    // client
    {
      account: {
        id: "ACCO_6D4BB711-CC33-4F63-AA95-287F093DAED7",
        // id: "ACCO_5D46BA71-75EB-4AFF-9386-4BC82D4BD391",
      },
      amount: {
        value: 4000,
      },
    },
  ],
}

const registerCheckout = async (order: any, pagOrder: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkoutObj = {
        reference_id: order.id,
        expiration_date: new Date(
          new Date(pagOrder.created_at).getTime() + fiveMinutes
        ).toISOString(),
        items: order.items ?? [],
        payment_methods: [{ type: "PIX" }],
        notification_urls: [process.env.thisUrl],
        payment_notification_urls: [process.env.thisUrl],
      }

      let checkout: any = {}

      await axios.post(`${pbUrl}/checkouts`, checkoutObj).then((res) => {
        checkout = res.data
      })

      resolve(checkout)
    } catch (error) {
      reject(error)
    }
  })
}

export const getQrCode = async (req: Request, res: Response) => {
  try {
    const order = req.body

    const dataCheck = checkData(order)

    if (dataCheck.ok) {
      // ...
      await axios
        .post(`${pbUrl}/orders`, {
          ...order,
          qr_codes: [{ ...order.qr_codes[0] }],
          notification_urls: [process.env.thisUrl],
        })
        .then(async (response) => {
          const info = response.data

          if (info) {
            await registerCheckout(order, info)

            res.status(200).json({
              ok: true,
              data: info,
            })
          } else {
            res.status(400).json({
              ok: false,
              error: "Erro ao carregar o qrcode. Tente novamente mais tarde",
            })
          }
        })
        .catch((err: AxiosError) => {
          console.log(err)
          res.status(400).json({
            ok: false,
            error: "Erro ao carregar o qrcode. Tente novamente mais tarde",
            err,
          })
        })
    } else {
      res.status(400).json({
        ok: false,
        error: "Erro ao carregar o qrcode. Tente novamente mais tarde",
      })
    }
  } catch (error) {
    res.status(400).json({ received: "false" })
  }
}

export const orderUpdate = async (req: Request, res: Response) => {
  try {
    const order = req.body

    if (order.charges.length > 0) {
      const payment = order.charges[0]
      const orderId = order.reference_id
      const status = payment.status
      const amount = payment.amount.value

      const message = getMessage(status)

      const data = { status, amount, message, orderId, code: payment.id }

      // socket.emit...
      // filter by socket.id
      const sockets = await io.fetchSockets()
      const client = sockets.find((s) => s.id === orderId)

      if (client) {
        client.emit("orderUpdate", data)
      }
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    res.status(400).json({ received: "false" })
  }
}
