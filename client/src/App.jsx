import './App.css'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/HomePage'
import LoginPage from './pages/loginPage'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/home' element={<HomePage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
