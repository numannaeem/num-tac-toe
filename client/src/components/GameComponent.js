import React, { useEffect, useState } from 'react'
import { CircularProgress, Stack, Typography, Box, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ReplayIcon from '@mui/icons-material/Replay'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import baseUrl from '../baseUrl'

function GameComponent ({ userName }) {
  const params = useParams()
  const navigate = useNavigate()

  const { roomName } = params
  const [gameState, setGameState] = useState(Array(9).fill(''))
  const [waiting, setWaiting] = useState(true)
  const [playerLeft, setPlayerLeft] = useState(false)
  const [waitingRestart, setWaitingRestart] = useState(false)
  const [yourTurn, setYourTurn] = useState()
  const [yourChar, setYourChar] = useState(null)
  const [winnerText, setWinnerText] = useState(null)
  const [winningPos, setWinningPos] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling', 'flashsocket'],
      query: {
        roomName,
        userName
      }
    })
    setSocket(newSocket)

    return () => newSocket.close()
  }, [roomName])

  useEffect(() => {
    if (socket) {
      socket.on('init-game', data => {
        setWinningPos([])
        setWaitingRestart(false)
        setWinnerText(null)
        setGameState(Array(9).fill(''))
        setWaiting(false)
        if (data.x === socket.id) {
          setYourChar('x')
          setYourTurn(true)
        } else {
          setYourChar('o')
        }
      })
      socket.on('player-left', () => {
        setPlayerLeft(true)
      })
      socket.on('next-turn', data => {
        setGameState(data.gameState)
        if (data.nextPlayer === socket.id) {
          setYourTurn(true)
        }
      })
      socket.on('game-over', data => {
        if (data.winner === 'draw') {
          setWinnerText('Game draw')
          setGameState(data.finalState)
        } else {
          setWinningPos(data.winningPosition)
          if (data.winner === socket.id) {
            setWinnerText('You win')
          } else {
            setGameState(data.finalState)
            setWinnerText('Opponent wins')
          }
        }
      })
    }
  }, [socket])

  const handleClick = i => {
    if (yourTurn) {
      let newState = gameState
      newState[i] = yourChar
      setYourTurn(false)
      setGameState(newState)
      socket.emit('played', newState)
    }
  }

  const restartGame = () => {
    setWaitingRestart(true)
    socket.emit('restart-game')
  }
  return (
    <Box
      style={{ backgroundColor: 'rgb(255, 242, 232)' }}
      minHeight='100vh'
      minWidth='100vw'
      alignItems='center'
      justifyContent='center'
      display='flex'
    >
      {playerLeft ? (
        <Stack spacing={2} alignItems='center' justifyContent='center'>
          <Typography variant='h5' textAlign='center'>
            Oops! Your opponent has left the game :(
          </Typography>
          <Button
            variant='outlined'
            onClick={() => navigate('/')}
            color='secondary'
          >
            Go back to menu
          </Button>
        </Stack>
      ) : waiting ? (
        <Stack spacing={2} alignItems='center' justifyContent='center'>
          <Typography variant='h5' textAlign='center'>
            Waiting for other player to join
          </Typography>
          <CircularProgress color='secondary' />
        </Stack>
      ) : (
        <Stack spacing={3} alignItems='center' justifyContent='center'>
          <Typography variant='h5'>
            {winnerText || (yourTurn ? 'Your turn' : "Opponent's turn")}
          </Typography>
          <Box sx={{ boxShadow: 10 }} className='game-board'>
            {gameState.map((a, i) => (
              <div
                key={i}
                onClick={() => handleClick(i)}
                className={`inner-box ${yourTurn &&
                  `active ${yourChar}-active`} ${a &&
                  'occupied'} ${winningPos.includes(i) && 'bg-green'} ${a}`}
              ></div>
            ))}
          </Box>
          {winnerText ? (
            <LoadingButton
              onClick={restartGame}
              loading={waitingRestart}
              startIcon={<ReplayIcon />}
              loadingPosition='start'
              variant='contained'
            >
              {!waitingRestart ? 'Play Again' : 'Waiting for other player'}
            </LoadingButton>
          ) : (
            <div style={{ height: '36.5px' }}></div>
          )}
        </Stack>
      )}
    </Box>
  )
}

export default GameComponent
