import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './App.css'
import { migrateFromLocalStorage } from './db/migration'

// localStorageからIndexedDBへマイグレーション後にアプリを起動
migrateFromLocalStorage().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>,
  )
})
