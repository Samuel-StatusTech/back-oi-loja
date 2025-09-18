import express, { Express, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"
import bodyParser from "body-parser"

import { createServer } from "node:http"
const socketIO = require("socket.io")
const Server = socketIO

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8080

app.use(cors({ origin: "*" }))
app.use(bodyParser.json())

app.use("/api", routes)

app.use("*", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

const server = createServer(app)

server.listen(port)

export const io = new Server(server, {
  cors: { origin: "*" },
  allowEIO3: true,
})

export const formatRoomName = (socketId: string) => `webstore_order-${socketId}`

io.on("connection", (socket: any) => {


  // Create and join room for payment
  socket.join(formatRoomName(socket.id))

  socket.on(
    "rejoinPaymentSession",
    (pendingPayment: { paymentId: string; oldSocketId: string }) => {
      // Verificar se o paymentId é válido
      // ...

      // Adicionar o novo socket à sala do pagamento
      socket.leave(formatRoomName(socket.id))
      socket.join(formatRoomName(pendingPayment.oldSocketId))

      // O servidor agora pode continuar a enviar atualizações para esta "sala"
      // usando io.to(`payment-${paymentId}`).emit(...)
    }
  )

  socket.emit("plugged", socket.id)
})

io.on("connect_error", (err: any) => {
  console.log(err)
})

export default app
