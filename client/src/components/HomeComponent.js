import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useNavigate} from 'react-router-dom'
import baseUrl from '../baseUrl'
import { Typography } from '@mui/material'
import { purple } from '@mui/material/colors'

function HomeComponent ({ setUserName }) {
  const [roomName, setRoomName] = useState('')
  // const [innerUserName, setInnerUserName] = useState('')
  const [inputLoading, setInputLoading] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async e => {
    setInputLoading(true)
    e.preventDefault()
    const res = await fetch(baseUrl+'/checkRoom/'+roomName)
    if(res.ok) {
      navigate('room/' + roomName)
    } else {
      setError(true)
    }
    setInputLoading(false)
  }
  return (
    <form onSubmit={handleSubmit}>
      <Box height='100vh' bgcolor={purple[50]} >
        <Stack
          height='100%'
          alignItems='center'
          justifyContent='center'
          spacing={10}
        >
          <Box textAlign='center'>
            <Typography variant="h2" color="secondary" >TIC-TAC-TOE</Typography>
            <Typography variant="overline">Create a room or join an existing one to start playing!</Typography>
          </Box>
          <Stack spacing={1}>
            {/* <TextField
              color='primary'
              value={innerUserName}
              onChange={e => setInnerUserName(e.target.value)}
              label='Enter your name'
              variant='outlined'
            /> */}
            <TextField
              disabled={inputLoading}
              error={error}
              helperText={error && 'Room name taken!'}
              color='secondary'
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              label='Enter room name'
              variant='outlined'
            />
            <Button
              disabled={roomName.length === 0}
              color='secondary'
              type='submit'
              variant='contained'
              title='Join game'
            >
              Join game
            </Button>
          </Stack>
        </Stack>
      </Box>
    </form>
  )
}

export default HomeComponent
