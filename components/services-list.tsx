"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  supabaseStorage,
  type Service,
  type Vehicle,
  type Cliente,
  SERVICIOS_DISPONIBLES,
  TIPOS_ACEITE,
} from "@/lib/supabase-storage"
import { Gauge, User, DollarSign, Wrench, Filter, Download, CheckCircle, Clock, Mail, MessageCircle, Trash2 } from 'lucide-react'
import { formatDate, formatCurrency } from "@/lib/date-utils"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { sendWhatsAppNotification, sendEmailNotification } from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface ServicesListProps {
  startDate?: string
  endDate?: string
}

export function ServicesList({ startDate, endDate }: ServicesListProps) {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [vehicles, setVehicles] = useState<Map<string, Vehicle>>(new Map())
  const [clientes, setClientes] = useState<Map<string, Cliente>>(new Map())
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [startDate, endDate])

  useEffect(() => {
    applyFilters()
  }, [services, selectedServiceTypes])

  const loadServices = async () => {
    setLoading(true)
    try {
      let allServices = []

      if (startDate && endDate) {
        allServices = await supabaseStorage.getServicesByDateRange(startDate, endDate)
      } else {
        allServices = await supabaseStorage.getServices()
      }

      allServices.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      setServices(allServices)

      const vehiclesMap = new Map<string, Vehicle>()
      const clientesMap = new Map<string, Cliente>()

      for (const service of allServices) {
        if (!vehiclesMap.has(service.vehicleId)) {
          const vehicle = await supabaseStorage.getVehicleById(service.vehicleId)
          if (vehicle) {
            vehiclesMap.set(service.vehicleId, vehicle)

            if (!clientesMap.has(vehicle.clienteId)) {
              const cliente = await supabaseStorage.getClienteById(vehicle.clienteId)
              if (cliente) {
                clientesMap.set(vehicle.clienteId, cliente)
              }
            }
          }
        }
      }
      setVehicles(vehiclesMap)
      setClientes(clientesMap)
    } catch (error) {
      console.error("Error cargando servicios:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (selectedServiceTypes.length === 0) {
      setFilteredServices(services)
    } else {
      const filtered = services.filter((service) =>
        selectedServiceTypes.some((type) => service.servicios.includes(type)),
      )
      setFilteredServices(filtered)
    }
  }

  const handleServiceTypeToggle = (serviceType: string) => {
    setSelectedServiceTypes((prev) =>
      prev.includes(serviceType) ? prev.filter((t) => t !== serviceType) : [...prev, serviceType],
    )
  }

  const clearFilters = () => {
    setSelectedServiceTypes([])
  }

  const handleDownloadInvoice = (service: Service) => {
    const vehicle = vehicles.get(service.vehicleId)
    if (!vehicle) {
      alert("No se encontró el vehículo")
      return
    }

    const cliente = clientes.get(vehicle.clienteId)
    if (!cliente) {
      alert("No se encontró el cliente")
      return
    }

    generateInvoicePDF({ service, vehicle, cliente })
  }

  const handleFinalizarServicio = async (service: Service) => {
    const vehicle = vehicles.get(service.vehicleId)
    if (!vehicle) {
      alert("No se encontró el vehículo")
      return
    }

    const cliente = clientes.get(vehicle.clienteId)
    if (!cliente) {
      alert("No se encontró el cliente")
      return
    }

    const updatedService = await supabaseStorage.updateService(service.id, { estado: "Finalizado" })
    if (!updatedService) {
      alert("Error al finalizar el servicio")
      return
    }

    loadServices()

    toast({
      title: "Servicio Finalizado",
      description: "¿Desea notificar al cliente?",
      duration: 10000,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-green-500 text-white hover:bg-green-600 border-0"
            onClick={() => sendWhatsAppNotification(updatedService, vehicle, cliente)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600 border-0"
            onClick={() => sendEmailNotification(updatedService, vehicle, cliente)}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        </div>
      ),
    })
  }

  const handleDeleteService = async () => {
    if (!deleteServiceId) return
    
    const success = await supabaseStorage.deleteService(deleteServiceId)
    if (success) {
      setDeleteServiceId(null)
      loadServices()
    } else {
      alert("Error al eliminar el servicio")
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando servicios...</p>
        </CardContent>
      </Card>
    )
  }

  if (services.length === 0) {
    return (
      <Card className="bg-white border-primary/20">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No hay servicios registrados en este período</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={deleteServiceId !== null}
        title="Eliminar Servicio"
        message="¿Está seguro que desea eliminar este servicio? Esta acción no se puede deshacer."
        onConfirm={handleDeleteService}
        onCancel={() => setDeleteServiceId(null)}
      />

      <Card className="bg-white border-primary/20">
        <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
          <CardTitle className="text-primary flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar por tipo de servicio
              {selectedServiceTypes.length > 0 && (
                <span className="text-sm font-normal text-accent">({selectedServiceTypes.length} seleccionados)</span>
              )}
            </span>
            <span className="text-sm font-normal text-foreground/70">{showFilters ? "Ocultar" : "Mostrar"}</span>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SERVICIOS_DISPONIBLES.map((serviceType) => (
                <div key={serviceType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-${serviceType}`}
                    checked={selectedServiceTypes.includes(serviceType)}
                    onCheckedChange={() => handleServiceTypeToggle(serviceType)}
                    className="border-primary/30"
                  />
                  <Label
                    htmlFor={`filter-${serviceType}`}
                    className="text-sm text-foreground cursor-pointer leading-tight"
                  >
                    {serviceType}
                  </Label>
                </div>
              ))}
            </div>
            {selectedServiceTypes.length > 0 && (
              <div className="flex justify-end">
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                  Limpiar filtros
                </button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {filteredServices.length === 0 ? (
        <Card className="bg-white border-primary/20">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No hay servicios que coincidan con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredServices.map((service) => {
          const vehicle = vehicles.get(service.vehicleId)

          let proximoCambioAceite: number | null = null
          if (service.servicios.includes("Cambio de aceite") && service.tipoAceite) {
            const duracion = TIPOS_ACEITE[service.tipoAceite].duracion
            proximoCambioAceite = service.kilometraje + duracion
          }

          return (
            <Card key={service.id} className="bg-white border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    {vehicle ? `${vehicle.marca} ${vehicle.modelo} - ${vehicle.matricula}` : "Vehículo no encontrado"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        service.estado === "Finalizado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {service.estado === "Finalizado" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      {service.estado}
                    </span>
                    <span className="text-base font-normal text-foreground/70">{formatDate(service.fecha)}</span>
                    <Button
                      onClick={() => handleDownloadInvoice(service)}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-primary-foreground"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Factura
                    </Button>
                    <Button
                      onClick={() => setDeleteServiceId(service.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-foreground">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span>{service.kilometraje.toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span>{service.mecanico}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatCurrency(service.costo)}</span>
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
                  <div className="bg-accent/10 border border-accent rounded-lg p-3 mt-3">
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

                {service.estado === "En Proceso" && (
                  <div className="pt-3 border-t border-primary/20">
                    <Button
                      onClick={() => handleFinalizarServicio(service)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finalizar Servicio y Notificar Cliente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
