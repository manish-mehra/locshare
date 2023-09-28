import express, { Express, Request, Response } from 'express'
import {Socket, Server} from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to LocShare!')
})


const server = app.listen(port, () => {
  console.log(`Server is running`)
})

const io: Server = new Server(server, {
  cors: {
    origin: '*',
  },
})

// Define a custom interface extending the Socket interface
interface CustomSocket extends Socket {
  roomId?: string
}

const roomCreator = new Map<string, string>() // roomid => socketid

io.on('connection', (socket: CustomSocket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('createRoom', (data) => {
    const roomId = Math.random().toString(36).substring(2, 7)
    socket.join(roomId)
    const totalRoomUsers = io.sockets.adapter.rooms.get(roomId)
    socket.emit('roomCreated', { 
      roomId,
      position: data.position,
      totalConnectedUsers: Array.from(totalRoomUsers || []),
    })
    roomCreator.set(roomId, socket.id)
    socket.roomId = roomId //  attach roomId to socket
  })

  socket.on('joinRoom', (data: {roomId: string}) => {

    // check if room exists
    const roomExists = io.sockets.adapter.rooms.has(data.roomId)
    if (roomExists) {
      socket.join(data.roomId)
      socket.roomId = data.roomId //  attach roomId to socket

      // Notify the room creator about the new user     
      const creatorSocketID = roomCreator.get(data.roomId)
      if (creatorSocketID) {
        const creatorSocket = io.sockets.sockets.get(creatorSocketID) // get socket instance of creator
        if (creatorSocket) {
          const totalRoomUsers = io.sockets.adapter.rooms.get(data.roomId)
          creatorSocket.emit('userJoinedRoom', {
            userId: socket.id,
            totalConnectedUsers: Array.from(totalRoomUsers || [])
          })
        }
      }
      // msg to joiner
      io.to(`${socket.id}`).emit('roomJoined', {
        status: 'OK',
      })

    } else {
      io.to(`${socket.id}`).emit('roomJoined', {
        status: 'ERROR'
      })
    }
  })
  
  socket.on('updateLocation', (data) => {
    io.emit('updateLocationResponse', data)
  })
 
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)

    const roomId = socket.roomId
    if(roomId){
      // if disconnected user is creator, destroy room
      if(roomCreator.get(roomId) === socket.id){
        // notify users in room that room is destroyed
        const roomUsers = io.sockets.adapter.rooms.get(roomId)
        if(roomUsers){
          for (const socketId of roomUsers) {
            io.to(`${socketId}`).emit('roomDestroyed', {
              status: 'OK'
            })
          }
        }
        io.sockets.adapter.rooms.delete(roomId)
        roomCreator.delete(roomId)    
      } else{
        socket.leave(roomId)
        // notify creator that user left room
        const creatorSocketId = roomCreator.get(roomId)
        if(creatorSocketId){
          const creatorSocket = io.sockets.sockets.get(creatorSocketId)
          if(creatorSocket){
            creatorSocket.emit('userLeftRoom', {
              userId: socket.id,
              totalConnectedUsers: Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            })
          }
        }
      }
    }

  })
  
})