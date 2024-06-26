import { Request, Response } from "express"
import axios, { AxiosError } from "axios"
import { checkData } from "../helpers/checkData"

const pbToken =
  "Bearer f4e9071a-4bb9-4060-8757-759cf8b0b20564cdec3640fb9ac8453dbc67a15adebfde6e-2625-4e23-950c-4f5956856ce7"

axios.defaults.headers.Authorization = pbToken

export const getQrCode = async (req: Request, res: Response) => {
  try {
    const order = req.body
    console.log(order)

    const dataCheck = checkData(order)

    if (dataCheck.ok) {
      // ...
      await axios
        .post(`https://sandbox.api.pagseguro.com/orders`, order)
        .then((response) => {
          const info = response.data

          if (info) {
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
          res.status(400).json({
            ok: false,
            error: "Erro ao carregar o qrcode. Tente novamente mais tarde",
            description: err,
          })
        })
    } else {
      const { fields } = dataCheck

      res.status(404).json({ errors: fields })
    }
  } catch (error) {
    res.status(400).json({ received: "false" })
  }
}
