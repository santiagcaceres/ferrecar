"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type Cliente } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface ClienteFormProps {
  onSuccess?: (cliente: Cliente) => void
  onCancel?: () => void
}

export function ClienteForm({ onSuccess, onCancel }: ClienteFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    observaciones: "",
    cedula: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const cliente = storage.saveCliente(formData)
      toast({
        title: "Cliente registrado",
        description: `${cliente.nombre} ha sido agregado al sistema`,
      })

      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        observaciones: "",
        cedula: "",
      })

      onSuccess?.(cliente)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el cliente",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-white border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Registrar Cliente</CardTitle>
        <CardDescription className="text-foreground/70">Ingrese los datos del nuevo cliente</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre Completo *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan Pérez"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula" className="text-foreground">
                Cédula
              </Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="12345678"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground">
                Teléfono *
              </Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="099123456"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observaciones" className="text-foreground">
                Observaciones
              </Label>
              <Input
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales sobre el cliente"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-primary/30 text-foreground bg-transparent"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Registrar Cliente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
