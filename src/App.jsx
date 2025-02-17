import { useState } from 'react'
import './App.css'
import './index.css'
import { Signup } from './pages/signup'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signin } from './pages/signin'
import { Dashboard } from './pages/dashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path='/signup' element={<Signup />}/>
          <Route path='/signin' element={<Signin />}/>
          <Route path='/dashboard' element={<Dashboard />}/>
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App