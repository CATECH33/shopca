import React from 'react'
import { Outlet } from 'react-router-dom'
import { ManagerAuthProvider } from './ManagerAuthProvider.jsx'

export default function ManagerRoot() {
  return (
    <ManagerAuthProvider>
      <Outlet />
    </ManagerAuthProvider>
  )
}
