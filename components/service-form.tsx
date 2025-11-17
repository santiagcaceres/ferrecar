"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { supabaseStorage, SERVICIOS_DISPONIBLES, TIPOS_ACEITE, type Vehicle, type TipoAceite } from "@/lib/supabase-storage"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ServiceFormProps {
  vehicle?: Vehicle
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceForm({ vehicle: initialVehicle, onSuccess, onCancel }: ServiceFormProps) {
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(initialVehicle || null)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const data = await supabaseStorage.getVehicles()
      setVehicles(data)
    } catch (error) {
      console.error("[v0] Error al cargar vehículos:", error)
    }
  }

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    kilometraje: "" as string | number,
    servicios: [] as string[],
    tipoAceite: undefined as TipoAceite | undefined,
    otroServicio: "",
    observaciones: "",
    costo: "" as string | number,
    mecanico: "",
  })

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nombreDueño.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${v.marca} ${v.modelo}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleServiceToggle = (servicio: string) => {
    setFormData((prev) => {
      const newServicios = prev.servicios.includes(servicio)
        ? prev.servicios.filter((s) => s !== servicio)
        : [...prev.servicios, servicio]

      const tipoAceite = newServicios.includes("Cambio de aceite") ? prev.tipoAceite : undefined

      return {
        ...prev,
        servicios: newServicios,
        tipoAceite,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedVehicle) {
      toast({
        title: "Error",
        description: "Debe seleccionar un vehículo",
        variant: "destructive",
      })
      return
    }

    if (formData.servicios.length === 0 && !formData.otroServicio) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un servicio",
        variant: "destructive",
      })
      return
    }

    if (formData.servicios.includes("Cambio de aceite") && !formData.tipoAceite) {
      toast({
        title: "Error",
        description: "Debe seleccionar el tipo de aceite",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const servicios = [...formData.servicios]
      if (formData.otroServicio) {
        servicios.push(formData.otroServicio)
      }

      await supabaseStorage.saveService({
        vehicleId: selectedVehicle.id,
        fecha: formData.fecha,
        kilometraje: Number(formData.kilometraje) || 0,
        servicios,
        tipoAceite: formData.tipoAceite,
        observaciones: formData.observaciones,
        costo: Number(formData.costo) || 0,
        mecanico: formData.mecanico,
        estado: "En Proceso",
      })

      toast({
        title: "Servicio registrado",
        description: `Servicio registrado para ${selectedVehicle.matricula} - Estado: En Proceso`,
      })

      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error al guardar servicio:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el servicio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Registrar Servicio</CardTitle>
        <CardDescription className="text-foreground/70">
          {selectedVehicle
            ? `${selectedVehicle.marca} ${selectedVehicle.modelo} - ${selectedVehicle.matricula}`
            : "Seleccione un vehículo para continuar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!initialVehicle && (
            <div className="space-y-2">
              <Label className="text-foreground">Vehículo *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white border-primary/30 text-foreground hover:bg-background/50"
                  >
                    {selectedVehicle ? (
                      <span>
                        <span className="font-semibold">{selectedVehicle.matricula}</span>
                        {" - "}
                        {selectedVehicle.marca} {selectedVehicle.modelo}
                        {" - "}
                        {selectedVehicle.nombreDueño}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Buscar por matrícula...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0 bg-white border-primary/30" align="start">
                  <Command className="bg-white">
                    <div className="flex items-center border-b border-primary/20 px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-foreground" />
                      <input
                        placeholder="Buscar por matrícula, dueño o vehículo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex h-11 w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-foreground/70">
                        No se encontraron vehículos.
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredVehicles.map((vehicle) => (
                          <CommandItem
                            key={vehicle.id}
                            value={vehicle.id}
                            onSelect={() => {
                              setSelectedVehicle(vehicle)
                              setOpen(false)
                              setSearchQuery("")
                            }}
                            className="cursor-pointer text-foreground hover:bg-background/50"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedVehicle?.id === vehicle.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold">{vehicle.matricula}</span>
                              <span className="text-sm text-foreground/70">
                                {vehicle.marca} {vehicle.modelo} ({vehicle.año}) - {vehicle.nombreDueño}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-foreground">
                Fecha *
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
                className="bg-white border-primary/30 text-foreground"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kilometraje" className="text-foreground">
                Kilometraje *
              </Label>
              <Input
                id="kilometraje"
                type="number"
                value={formData.kilometraje}
                onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                placeholder="50000"
                required
                min="0"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mecanico" className="text-foreground">
                Mecánico *
              </Label>
              <Input
                id="mecanico"
                value={formData.mecanico}
                onChange={(e) => setFormData({ ...formData, mecanico: e.target.value })}
                placeholder="Nombre del mecánico"
                required
                className="bg-white border-primary/30 text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costo" className="text-foreground">
                Costo (UYU) *
              </Label>
              <Input
                id="costo"
                type="number"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                placeholder="5000"
                required
                min="0"
                step="0.01"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">Servicios Realizados *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <div className="space-y-3">
                {SERVICIOS_DISPONIBLES.filter(
                  (s) =>
                    s === "Cambio de aceite" ||
                    s === "Filtro de aceite" ||
                    s === "Filtro de aire" ||
                    s === "Filtro de combustible" ||
                    s === "Filtro de habitáculo",
                ).map((servicio) => (
                  <div key={servicio} className="flex items-center space-x-2">
                    <Checkbox
                      id={servicio}
                      checked={formData.servicios.includes(servicio)}
                      onCheckedChange={() => handleServiceToggle(servicio)}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor={servicio}
                      className="text-sm text-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {servicio}
                    </label>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {SERVICIOS_DISPONIBLES.filter(
                  (s) =>
                    s !== "Cambio de aceite" &&
                    s !== "Filtro de aceite" &&
                    s !== "Filtro de aire" &&
                    s !== "Filtro de combustible" &&
                    s !== "Filtro de habitáculo" &&
                    s !== "Otro",
                ).map((servicio) => (
                  <div key={servicio} className="flex items-center space-x-2">
                    <Checkbox
                      id={servicio}
                      checked={formData.servicios.includes(servicio)}
                      onCheckedChange={() => handleServiceToggle(servicio)}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor={servicio}
                      className="text-sm text-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {servicio}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {formData.servicios.includes("Cambio de aceite") && (
              <div className="space-y-3 pt-2 pl-6 border-l-4 border-accent">
                <Label className="text-foreground font-semibold">Tipo de Aceite *</Label>
                <RadioGroup
                  value={formData.tipoAceite}
                  onValueChange={(value) => setFormData({ ...formData, tipoAceite: value as TipoAceite })}
                  className="space-y-2"
                >
                  {Object.entries(TIPOS_ACEITE).map(([tipo, info]) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <RadioGroupItem value={tipo} id={`aceite-${tipo}`} className="border-primary text-primary" />
                      <Label
                        htmlFor={`aceite-${tipo}`}
                        className="text-sm text-foreground cursor-pointer leading-none font-normal"
                      >
                        {info.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="otroServicio" className="text-foreground">
                Otro servicio
              </Label>
              <Input
                id="otroServicio"
                value={formData.otroServicio}
                onChange={(e) => setFormData({ ...formData, otroServicio: e.target.value })}
                placeholder="Especificar otro servicio"
                className="bg-white border-primary/30 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-foreground">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Notas adicionales sobre el servicio..."
              rows={4}
              className="bg-white border-primary/30 text-foreground resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-primary/30 text-foreground bg-transparent"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Registrar Servicio"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
