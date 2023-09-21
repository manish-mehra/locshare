import express, { Express, Request, Response } from 'express'
import {Socket, Server} from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to LocShare!')
})


const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})

const io: Server = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`)
  socket.on('ping', () => {
    console.log('ping received')
    socket.emit('pong', 'Hello from server')
  })
  socket.on('createRoom', (data) => {
    const roomId = Math.random().toString(36).substring(2, 7)
    socket.join(roomId)
    socket.emit('roomCreated', {
      ...data,
      roomId,
      msg: 'Room created successfully'
    })
  })
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})