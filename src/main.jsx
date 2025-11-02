import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './routes/Layout'
import Dashboard from './routes/Dashboard'
import ChartsView from './routes/ChartsView'
import DetailView from './routes/DetailView'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/charts/:location" element={<ChartsView />} />
          <Route path="/details/:name/:lat/:lon" element={<DetailView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
