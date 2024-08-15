import { Request, Response } from "express"
import dotenv from "dotenv"
import { io } from "../app"
import { getMessage } from "../helpers/getMessage"
import { Payment, MercadoPagoConfig } from "mercadopago"
import axios from "axios"

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
    const orderData = req.body

    const updateId = orderData.data.id

    const sockets = await io.fetchSockets()

    await axios
      .get(`https://api.mercadopago.com/v1/payments/${updateId}`, {
        headers: {
          Authorization: `Bearer ${process.env.mpAToken}`,
        },
      })
      .then((response) => {
        const order = response.data

        const orderId = order.transaction_details.transaction_id
        const sId = order.metadata.c_code

        const client = sockets.find((s) => s.id === sId)

        if (
          order?.transaction_details?.total_paid_amount ===
          order.transaction_amount
        ) {
          const pmt = order.transaction_details
          const status = order.status
          const amount = pmt.total_paid_amount

          const message = getMessage(status)

          const data = {
            status,
            amount,
            message,
            sId,
            orderId,
            code: pmt.id,
          }

          if (client) client.emit("orderUpdate", data)
        }
      })
      .catch((err) => {
        const data = {
          status: "denied",
          message: getMessage("declined"),
          updateId,
          code: null,
        }

        const client = sockets.find((s) => s.id === updateId)
        if (client) client.emit("orderUpdate", data)
      })

    res.status(200).json({ ok: true })
  } catch (error) {
    res.status(400).json({ received: "false" })
  }
}
