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

app.use(cors({ origin: "*" }))
app.use(bodyParser.json())

app.use("/api", routes)

app.use("*", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

const server = createServer(app)

server.listen(port)

export const io = new Server(server, { cors: { origin: "*" } })

export default app
