import express, { Express, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"
import bodyParser from "body-parser"

import { createServer } from "node:http"
import { Server } from "socket.io"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(bodyParser.json())

app.use("/api", routes)

app.use("*", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

const server = createServer(app)

server.listen(port, () => {
  console.log(`[server]: Server is running at port: ${port}`)
})

export const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? undefined : "*",
  },
})

io.on("connection", (socket) => {
  console.log("user connected", socket.id)
})

export default app
