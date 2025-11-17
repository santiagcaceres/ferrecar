"use client"

import { useState, useEffect } from "react"
import { supabaseStorage, type Cliente, type Vehicle, type Service } from "@/lib/supabase-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, Mail, FileText, Car, Calendar, Trash2 } from 'lucide-react'
import { formatCurrency } from "@/lib/date-utils"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface ClienteDetailProps {
  cliente: Cliente
  onBack: () => void
}

export function ClienteDetail({ cliente, onBack }: ClienteDetailProps) {
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([])
  const [servicios, setServicios] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [cliente.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const vehs = await supabaseStorage.getVehiclesByCliente(cliente.id)
      setVehiculos(vehs)

      const allServicios: Service[] = []
      for (const veh of vehs) {
        const servs = await supabaseStorage.getServicesByVehicle(veh.id)
        allServicios.push(...servs)
      }
      setServicios(allServicios.sort((a, b) => b.fecha.localeCompare(a.fecha)))
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalGastado = servicios.reduce((sum, s) => sum + s.costo, 0)

  const handleDeleteCliente = async () => {
    const success = await supabaseStorage.deleteCliente(cliente.id)
    if (success) {
      setShowDeleteDialog(false)
      onBack()
    } else {
      alert("Error al eliminar el cliente.")
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-primary/30 text-foreground bg-transparent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar Cliente
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Eliminar Cliente"
        message={`¿Está seguro que desea eliminar al cliente ${cliente.nombre}? Los vehículos asociados se mantendrán sin dueño asignado hasta que se les asigne uno nuevo.`}
        onConfirm={handleDeleteCliente}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Información del Cliente */}
      <Card className="bg-white border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="h-6 w-6" />
            {cliente.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Teléfono</p>
                <p className="font-medium">{cliente.telefono}</p>
              </div>
            </div>
            {cliente.email && (
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="font-medium">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.observaciones && (
              <div className="flex items-center gap-2 text-foreground md:col-span-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-foreground/60">Observaciones</p>
                  <p className="font-medium">{cliente.observaciones}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-primary/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{vehiculos.length}</div>
              <div className="text-sm text-foreground/60">Vehículos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{servicios.length}</div>
              <div className="text-sm text-foreground/60">Servicios</div>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalGastado)}</div>
              <div className="text-sm text-foreground/60">Total Gastado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehículos del Cliente */}
      <Card className="bg-white border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehículos ({vehiculos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehiculos.length === 0 ? (
            <p className="text-foreground/60 text-center py-4">No hay vehículos registrados</p>
          ) : (
            <div className="space-y-3">
              {vehiculos.map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="flex items-center justify-between p-3 border border-primary/10 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
                    </p>
                    <p className="text-sm text-foreground/60">Matrícula: {vehiculo.matricula}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {servicios.filter((s) => s.vehicleId === vehiculo.id).length} servicios
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Servicios */}
      <Card className="bg-white border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historial de Servicios ({servicios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {servicios.length === 0 ? (
            <p className="text-foreground/60 text-center py-4">No hay servicios registrados</p>
          ) : (
            <div className="space-y-3">
              {servicios.map((servicio) => {
                const vehiculo = vehiculos.find((v) => v.id === servicio.vehicleId)
                return (
                  <div key={servicio.id} className="p-4 border border-primary/10 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {vehiculo?.marca} {vehiculo?.modelo} - {vehiculo?.matricula}
                        </p>
                        <p className="text-sm text-foreground/60">
                          {new Date(servicio.fecha).toLocaleDateString("es-UY")} •{" "}
                          {servicio.kilometraje.toLocaleString("es-UY")} km
                        </p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">{formatCurrency(servicio.costo)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {servicio.servicios.map((srv, idx) => (
                        <Badge key={idx} variant="outline" className="border-primary/30 text-foreground text-xs">
                          {srv}
                        </Badge>
                      ))}
                    </div>
                    {servicio.observaciones && (
                      <p className="text-sm text-foreground/70 italic">{servicio.observaciones}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
