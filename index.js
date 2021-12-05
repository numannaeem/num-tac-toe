const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const path = require('path')
const { Server } = require('socket.io')
const io = new Server(server)
const cors = require('cors')

app.use(express.json()) //used to parse json requests
app.use(cors())
app.use(express.static(path.resolve(__dirname, './client/build')))

let roomData = {}

io.on('connection', async socket => {
  let { roomName } = socket.handshake.query
  let roomSize = io.of('/').adapter.rooms.get(roomName)?.size || 0
  if (roomSize < 2) {
    socket.join(roomName)
    console.log(`${socket.id} joined room - ${roomName}`)
    if (roomSize === 0) {
      roomData[roomName] = {
        gameState: Array(9).fill(''),
        players: [],
        currentPlayer: null,
        restartCount: 0
      }
      roomData[roomName].players.push(socket.id)
    } else {
      roomData[roomName].players.push(socket.id)
      let rand = Math.round(Math.random())
      roomData[roomName].currentPlayer = roomData[roomName].players[rand]

      io.in(roomName).emit('init-game', {
        x: roomData[roomName].currentPlayer,
        o: roomData[roomName].players[+!rand]
      })
    }
  } else {
    socket.emit('roomFull')
    socket.disconnect()
  }

  socket.on('played', async (gameState, result, position) => {
    if(result) {
      io.in(roomName).emit('game-over', {
        winner: result === 'd' ? winner : socket.id,
        finalState: gameState,
        winningPosition: position
      })
      return
    // let gameWinner = null
    // let position = []
    // let winningPositions = [
    //   [0, 1, 2],
    //   [3, 4, 5],
    //   [6, 7, 8],
    //   [0, 3, 6],
    //   [1, 4, 7],
    //   [2, 5, 8],
    //   [0, 4, 8],
    //   [2, 4, 6]
    // ]
    // for (let i = 0; i < 8; i++) {
    //   position = winningPositions[i]
    //   let a = gameState[position[0]]
    //   let b = gameState[position[1]]
    //   let c = gameState[position[2]]
    //   if (a == '' || b == '' || c == '') continue
    //   if (a == b && b == c) {
    //     gameWinner = roomData[roomName].currentPlayer
    //     break
    //   }
    // }
    // if (gameWinner === null && !gameState.includes('')) {
    //   gameWinner = 'draw'
    // }
    // if (gameWinner) {
    //   io.in(roomName).emit('game-over', {
    //     winner: gameWinner,
    //     finalState: gameState,
    //     winningPosition: position
    //   })
    } else {
      roomData[roomName].gameState = gameState
      const index = roomData[roomName].players.findIndex(
        i => i === roomData[roomName].currentPlayer
      )
      roomData[roomName].currentPlayer = roomData[roomName].players[+!index]

      io.in(roomName).emit('next-turn', {
        nextPlayer: roomData[roomName].currentPlayer,
        gameState: roomData[roomName].gameState
      })
    }
  })

  socket.on('restart-game', () => {
    roomData[roomName].restartCount++
    if (roomData[roomName].restartCount == 2) {
      let rand = Math.round(Math.random())
      roomData[roomName].gameState = Array(9).fill('')
      roomData[roomName].restartCount = 0
      roomData[roomName].currentPlayer = roomData[roomName].players[rand]

      io.in(roomName).emit('init-game', {
        x: roomData[roomName].currentPlayer,
        o: roomData[roomName].players[+!rand]
      })
    }
  })

  socket.on('disconnect', () => {
    io.in(roomName).emit('player-left')
    roomData[roomName] = null
    console.log(`${socket.id} disconnected`)
  })
})

app.get('/checkRoom/:roomName', (req, res) => {
  if(roomData[req.params.roomName]?.players.length === 2)
    res.status(404).send('room already taken')
  else res.status(200).send('room available')
})

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})


server.listen(process.env.PORT || 5000, err => {
  if (!err) console.log('listening on *:5000')
})
