export interface Vehicle {
  id: string
  matricula: string
  marca: string
  modelo: string
  año: number
  clienteId: string
  nombreDueño?: string
  telefono?: string
  email?: string
  createdAt: string
}

export interface Service {
  id: string
  vehicleId: string
  fecha: string
  kilometraje: number
  servicios: string[]
  tipoAceite?: "Mineral" | "Semi-sintético" | "Sintético"
  observaciones?: string
  costo: number
  mecanico: string
  estado: "En Proceso" | "Finalizado"
  createdAt: string
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email?: string
  observaciones?: string
  cedula?: string
  createdAt: string
}

export const SERVICIOS_DISPONIBLES = [
  "Cambio de aceite",
  "Filtro de aceite",
  "Filtro de aire",
  "Filtro de combustible",
  "Filtro de habitáculo",
  "Alineación",
  "Balanceo",
  "Rotación",
  "Tren delantero",
  "Frenos",
  "Suspensión",
  "Batería",
  "Neumáticos",
  "Revisión general",
  "Otro",
]

export const TIPOS_ACEITE = {
  Mineral: { duracion: 5000, label: "Mineral (5,000 km)" },
  "Semi-sintético": { duracion: 8000, label: "Semi-sintético (8,000 km)" },
  Sintético: { duracion: 10000, label: "Sintético (10,000 km)" },
} as const

export type TipoAceite = keyof typeof TIPOS_ACEITE

class LocalStorage {
  private VEHICLES_KEY = "ancap-ferre-vehicles"
  private SERVICES_KEY = "ancap-ferre-services"
  private CLIENTS_KEY = "ancap-ferre-clients"

  getVehicles(): Vehicle[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.VEHICLES_KEY)
    return data ? JSON.parse(data) : []
  }

  saveVehicle(vehicle: Omit<Vehicle, "id" | "createdAt">): Vehicle {
    const vehicles = this.getVehicles()
    const newVehicle: Vehicle = {
      ...vehicle,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    vehicles.push(newVehicle)
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(vehicles))
    return newVehicle
  }

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const vehicles = this.getVehicles()
    const index = vehicles.findIndex((v) => v.id === id)
    if (index === -1) return null
    vehicles[index] = { ...vehicles[index], ...updates }
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(vehicles))
    return vehicles[index]
  }

  deleteVehicle(id: string): boolean {
    const vehicles = this.getVehicles()
    const filtered = vehicles.filter((v) => v.id !== id)
    if (filtered.length === vehicles.length) return false
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(filtered))
    return true
  }

  getVehicleById(id: string): Vehicle | null {
    return this.getVehicles().find((v) => v.id === id) || null
  }

  searchVehicles(query: string): Vehicle[] {
    const vehicles = this.getVehicles()
    const lowerQuery = query.toLowerCase()
    return vehicles.filter(
      (v) =>
        v.matricula.toLowerCase().includes(lowerQuery) ||
        v.clienteId.toLowerCase().includes(lowerQuery) ||
        v.nombreDueño?.toLowerCase().includes(lowerQuery) ||
        v.marca.toLowerCase().includes(lowerQuery) ||
        v.modelo.toLowerCase().includes(lowerQuery),
    )
  }

  getServices(): Service[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.SERVICES_KEY)
    return data ? JSON.parse(data) : []
  }

  saveService(service: Omit<Service, "id" | "createdAt">): Service {
    const services = this.getServices()
    const newService: Service = {
      ...service,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    services.push(newService)
    localStorage.setItem(this.SERVICES_KEY, JSON.stringify(services))
    return newService
  }

  getServicesByVehicle(vehicleId: string): Service[] {
    return this.getServices()
      .filter((s) => s.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }

  getServicesByDateRange(startDate: string, endDate: string): Service[] {
    return this.getServices().filter((s) => {
      const serviceDate = new Date(s.fecha)
      return serviceDate >= new Date(startDate) && serviceDate <= new Date(endDate)
    })
  }

  deleteService(id: string): boolean {
    const services = this.getServices()
    const filtered = services.filter((s) => s.id !== id)
    if (filtered.length === services.length) return false
    localStorage.setItem(this.SERVICES_KEY, JSON.stringify(filtered))
    return true
  }

  getClientes(): Cliente[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(this.CLIENTS_KEY)
    return data ? JSON.parse(data) : []
  }

  saveCliente(cliente: Omit<Cliente, "id" | "createdAt">): Cliente {
    const clientes = this.getClientes()
    const newCliente: Cliente = {
      ...cliente,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    clientes.push(newCliente)
    localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clientes))
    return newCliente
  }

  updateCliente(id: string, updates: Partial<Cliente>): Cliente | null {
    const clientes = this.getClientes()
    const index = clientes.findIndex((c) => c.id === id)
    if (index === -1) return null
    clientes[index] = { ...clientes[index], ...updates }
    localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(clientes))
    return clientes[index]
  }

  deleteCliente(id: string): boolean {
    const clientes = this.getClientes()
    const filtered = clientes.filter((c) => c.id !== id)
    if (filtered.length === clientes.length) return false
    localStorage.setItem(this.CLIENTS_KEY, JSON.stringify(filtered))
    return true
  }

  getClienteById(id: string): Cliente | null {
    return this.getClientes().find((c) => c.id === id) || null
  }

  searchClientes(query: string): Cliente[] {
    const clientes = this.getClientes()
    const lowerQuery = query.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lowerQuery) ||
        c.telefono.includes(query) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery)) ||
        (c.cedula && c.cedula.includes(query)),
    )
  }

  getVehiclesByCliente(clienteId: string): Vehicle[] {
    return this.getVehicles().filter((v) => v.clienteId === clienteId)
  }

  updateService(id: string, updates: Partial<Service>): Service | null {
    const services = this.getServices()
    const index = services.findIndex((s) => s.id === id)
    if (index === -1) return null
    services[index] = { ...services[index], ...updates }
    localStorage.setItem(this.SERVICES_KEY, JSON.stringify(services))
    return services[index]
  }
}

export const storage = new LocalStorage()

export const saveVehicle = (vehicle: {
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  clientId: string
  ownerName?: string
  ownerPhone?: string
  ownerEmail?: string
}): string => {
  const newVehicle = storage.saveVehicle({
    matricula: vehicle.plate,
    marca: vehicle.brand,
    modelo: vehicle.model,
    año: vehicle.year,
    clienteId: vehicle.clientId,
    nombreDueño: vehicle.ownerName,
    telefono: vehicle.ownerPhone,
    email: vehicle.ownerEmail,
  })
  return newVehicle.id
}

export const saveService = (service: {
  vehicleId: string
  serviceDate: string
  serviceTypes: string[]
  mileage: number
  cost: number
  mechanic: string
  notes?: string
  tipoAceite?: TipoAceite
}): string => {
  const newService = storage.saveService({
    vehicleId: service.vehicleId,
    fecha: service.serviceDate,
    servicios: service.serviceTypes,
    kilometraje: service.mileage,
    costo: service.cost,
    mecanico: service.mechanic,
    observaciones: service.notes,
    tipoAceite: service.tipoAceite,
    estado: "En Proceso",
  })
  return newService.id
}
