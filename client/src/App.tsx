import {lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
const Home = lazy(() => import('./pages/Home'))
const Location = lazy(() => import('./pages/Location'))

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/location/:roomId" element={<Location />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;