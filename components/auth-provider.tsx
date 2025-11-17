"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const authenticated = localStorage.getItem("ancap_authenticated") === "true"
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-accent text-xl font-semibold">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <>{children}</>
}
