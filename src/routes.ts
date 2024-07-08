import { Request, Response, Router } from "express"
import * as PaymentController from "./controllers/PaymentController"

const routes = Router()

routes.get("/ping", (req: Request, res: Response) => {
  return res.status(200).json({ pong: true })
})

routes.post("/orders/qrcode", PaymentController.getQrCode)

routes.post("/orders/orderUpdate", PaymentController.orderUpdate)

export default routes
