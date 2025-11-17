"use client"

import { useState, useEffect } from "react"
import { supabaseStorage, type Cliente, type Vehicle } from "@/lib/supabase-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Phone, Mail, FileText, Award as IdCard, Car } from 'lucide-react'

interface ClientesListProps {
  onSelectCliente?: (cliente: Cliente) => void
}

interface ClienteConVehiculos extends Cliente {
  vehiculosCount: number
}

export function ClientesList({ onSelectCliente }: ClientesListProps) {
  const [clientes, setClientes] = useState<ClienteConVehiculos[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const clientesData = await supabaseStorage.getClientes()
      
      // Cargar el conteo de vehículos para cada cliente
      const clientesConVehiculos = await Promise.all(
        clientesData.map(async (cliente) => {
          const vehiculos = await supabaseStorage.getVehiclesByCliente(cliente.id)
          return {
            ...cliente,
            vehiculosCount: vehiculos.length
          }
        })
      )
      
      setClientes(clientesConVehiculos.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    } catch (error) {
      console.error("[v0] Error al cargar clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-foreground/60 text-center">Cargando clientes...</p>
        </CardContent>
      </Card>
    )
  }

  if (clientes.length === 0) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-primary/40 mb-4" />
          <p className="text-foreground/60 text-center">No hay clientes registrados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clientes.map((cliente) => {
        const vehiculos = cliente.vehiculos || []
        return (
          <Card
            key={cliente.id}
            className="bg-white border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => onSelectCliente?.(cliente)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-primary flex items-start justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {cliente.nombre}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cliente.cedula && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <IdCard className="h-4 w-4 text-primary" />
                  <span>CI: {cliente.cedula}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Phone className="h-4 w-4 text-primary" />
                <span>{cliente.telefono}</span>
              </div>
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.observaciones && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate">{cliente.observaciones}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2 border-t border-primary/10">
                <Car className="h-4 w-4" />
                <span>{cliente.vehiculosCount} vehículo{cliente.vehiculosCount !== 1 ? 's' : ''}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
