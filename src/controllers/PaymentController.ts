import { Request, Response } from "express"
import dotenv from "dotenv"
import { io } from "../app"
import { getMessage } from "../helpers/getMessage"
import { Payment, MercadoPagoConfig } from "mercadopago"

dotenv.config()

const client = new MercadoPagoConfig({
  accessToken: process.env.mpAToken as string,
  options: { timeout: 5000, idempotencyKey: `abc` },
})

const payment = new Payment(client)

export const getQrCode = async (req: Request, res: Response) => {
  try {
    const order = req.body

    // check order...

    payment
      .create({
        body: { ...order, notification_url: process.env.thisUrl },
        requestOptions: {
          idempotencyKey: `IKEY_${new Date().getTime()}`,
        },
      })
      .then((mpRes) => {
        res.status(200).json({
          ok: true,
          data: {
            qrcodes: {
              base64:
                mpRes.point_of_interaction?.transaction_data?.qr_code_base64,
              code: mpRes.point_of_interaction?.transaction_data?.qr_code,
            },
          },
        })
      })
      .catch((error) => {
        res.status(400).json({
          ok: false,
          error: "Erro ao carregar o qrcode. Tente novamente mais tarde",
        })
      })
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

      const sockets = await io.fetchSockets()
      const client = sockets.find((s) => s.id === orderId)

      if (client) client.emit("orderUpdate", data)
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    res.status(400).json({ received: "false" })
  }
}
