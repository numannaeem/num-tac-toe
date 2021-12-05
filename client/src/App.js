import React from 'react'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import GameComponent from './components/GameComponent'
import HomeComponent from './components/HomeComponent'

function App () {
  // const [userName, setUserName] = useState('')

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomeComponent />} />
        <Route path='/room/:roomName' element={<GameComponent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
