"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabaseStorage, type Vehicle, type Service, type Cliente, TIPOS_ACEITE } from "@/lib/supabase-storage"
import { ArrowLeft, Car, User, Phone, Mail, Calendar, Wrench, Download, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency } from "@/lib/date-utils"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface VehicleDetailProps {
  vehicleId: string
  onBack: () => void
  onAddService: () => void
}

export function VehicleDetail({ vehicleId, onBack, onAddService }: VehicleDetailProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [vehicleId])

  const loadData = async () => {
    setLoading(true)
    try {
      const v = await supabaseStorage.getVehicleById(vehicleId)
      setVehicle(v)
      if (v) {
        const servs = await supabaseStorage.getServicesByVehicle(v.id)
        setServices(servs)
        const c = await supabaseStorage.getClienteById(v.clienteId)
        setCliente(c)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = (service: Service) => {
    if (!vehicle || !cliente) {
      alert("No se pudo cargar la información necesaria")
      return
    }
    generateInvoicePDF({ service, vehicle, cliente })
  }

  const handleDeleteVehicle = async () => {
    if (!vehicle) return
    
    const success = await supabaseStorage.deleteVehicle(vehicle.id)
    if (success) {
      setShowDeleteDialog(false)
      onBack()
    } else {
      alert("Error al eliminar el vehículo. Verifica que no tenga servicios asociados.")
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

  if (!vehicle) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Vehículo no encontrado</p>
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
          Eliminar Vehículo
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Eliminar Vehículo"
        message={`¿Está seguro que desea eliminar el vehículo ${vehicle.marca} ${vehicle.modelo} - ${vehicle.matricula}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteVehicle}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <Card className="bg-white border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Car className="h-6 w-6" />
            {vehicle.marca} {vehicle.modelo} - {vehicle.matricula}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Año: {vehicle.año}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-primary" />
            <span>Dueño: {vehicle.nombreDueño}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>Teléfono: {vehicle.telefono}</span>
          </div>
          {vehicle.email && (
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email: {vehicle.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Historial de Servicios</h2>
        <Button onClick={onAddService} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Wrench className="h-4 w-4 mr-2" />
          Agregar Servicio
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="bg-white border-primary/20">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No hay servicios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => {
            let proximoCambioAceite: number | null = null
            if (service.servicios.includes("Cambio de aceite") && service.tipoAceite) {
              const duracion = TIPOS_ACEITE[service.tipoAceite].duracion
              proximoCambioAceite = service.kilometraje + duracion
            }

            return (
              <Card key={service.id} className="bg-white border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary text-lg flex items-center justify-between">
                    <span>{formatDate(service.fecha)}</span>
                    <Button
                      onClick={() => handleDownloadInvoice(service)}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-primary-foreground"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Factura
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-foreground">
                      <span className="font-medium">Kilometraje:</span> {service.kilometraje.toLocaleString()} km
                    </div>
                    <div className="text-foreground">
                      <span className="font-medium">Mecánico:</span> {service.mecanico}
                    </div>
                    <div className="text-foreground">
                      <span className="font-medium">Costo:</span> {formatCurrency(service.costo)}
                    </div>
                  </div>
                  <div className="text-foreground">
                    <span className="font-medium">Servicios realizados:</span>
                    <ul className="list-disc list-inside mt-1 text-foreground/80">
                      {service.servicios.map((s, i) => (
                        <li key={i}>
                          {s}
                          {s === "Cambio de aceite" && service.tipoAceite && (
                            <span className="font-semibold text-accent"> - {service.tipoAceite}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {proximoCambioAceite && (
                    <div className="bg-accent/10 border border-accent rounded-lg p-3">
                      <div className="flex items-center gap-2 text-accent font-semibold">
                        <Wrench className="h-4 w-4" />
                        <span>Próximo cambio de aceite: {proximoCambioAceite.toLocaleString()} km</span>
                      </div>
                    </div>
                  )}

                  {service.observaciones && (
                    <div className="text-foreground">
                      <span className="font-medium">Observaciones:</span>
                      <p className="text-foreground/80 mt-1">{service.observaciones}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
