"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock } from 'lucide-react'

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // En producción, esto debería ser verificado en el servidor
    setTimeout(() => {
      if (password === "ferrecar2025") {
        localStorage.setItem("ancap_authenticated", "true")
        onLogin()
      } else {
        setError("Contraseña incorrecta")
        setPassword("")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white border-accent/20 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">FerreCar Service</CardTitle>
          <CardDescription className="text-foreground/70 text-base">
            Sistema de Gestión de Servicios Vehiculares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/20 focus:border-primary"
                disabled={isLoading}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !password}
            >
              {isLoading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
