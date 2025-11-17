import { createClient } from "@/lib/supabase/client"
import type { Cliente, Vehicle, Service, TipoAceite } from "./storage"
import { SERVICIOS_DISPONIBLES as SERVICIOS, TIPOS_ACEITE as TIPOS } from "./storage"

// Re-exportando constantes para que estén disponibles
export { SERVICIOS as SERVICIOS_DISPONIBLES, TIPOS as TIPOS_ACEITE }

// También re-exportar tipos
export type { Cliente, Vehicle, Service, TipoAceite }

// Cliente functions
export async function getClientes(): Promise<Cliente[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clientes:", error)
    return []
  }

  return (data || []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    email: c.email,
    observaciones: c.observaciones,
    createdAt: c.created_at,
  }))
}

export async function saveCliente(
  cliente: Omit<Cliente, "id" | "createdAt">
): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      observaciones: cliente.observaciones,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving cliente:", error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    telefono: data.telefono,
    email: data.email,
    observaciones: data.observaciones,
    createdAt: data.created_at,
  }
}

export async function updateCliente(
  id: string,
  updates: Partial<Cliente>
): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clientes")
    .update({
      nombre: updates.nombre,
      telefono: updates.telefono,
      email: updates.email,
      observaciones: updates.observaciones,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating cliente:", error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    telefono: data.telefono,
    email: data.email,
    observaciones: data.observaciones,
    createdAt: data.created_at,
  }
}

export async function deleteCliente(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("clientes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting cliente:", error)
    return false
  }

  return true
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching cliente:", error)
    return null
  }

  return {
    id: data.id,
    nombre: data.nombre,
    telefono: data.telefono,
    email: data.email,
    observaciones: data.observaciones,
    createdAt: data.created_at,
  }
}

export async function searchClientes(query: string): Promise<Cliente[]> {
  const supabase = createClient()
  const lowerQuery = query.toLowerCase()
  
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .or(`nombre.ilike.%${lowerQuery}%,telefono.ilike.%${query}%,email.ilike.%${lowerQuery}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching clientes:", error)
    return []
  }

  return (data || []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    email: c.email,
    observaciones: c.observaciones,
    createdAt: c.created_at,
  }))
}

// Vehicle functions
export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles:", error)
    return []
  }

  return (data || []).map((v) => ({
    id: v.id,
    matricula: v.matricula,
    marca: v.marca,
    modelo: v.modelo,
    año: v.ano,
    clienteId: v.cliente_id,
    nombreDueño: v.clientes?.nombre,
    telefono: v.clientes?.telefono,
    email: v.clientes?.email,
    createdAt: v.created_at,
  }))
}

export async function saveVehicle(
  vehicle: Omit<Vehicle, "id" | "createdAt">
): Promise<Vehicle | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehiculos")
    .insert({
      matricula: vehicle.matricula,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.año,
      cliente_id: vehicle.clienteId,
    })
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .single()

  if (error) {
    console.error("Error saving vehicle:", error)
    return null
  }

  return {
    id: data.id,
    matricula: data.matricula,
    marca: data.marca,
    modelo: data.modelo,
    año: data.ano,
    clienteId: data.cliente_id,
    nombreDueño: data.clientes?.nombre,
    telefono: data.clientes?.telefono,
    email: data.clientes?.email,
    createdAt: data.created_at,
  }
}

export async function updateVehicle(
  id: string,
  updates: Partial<Vehicle>
): Promise<Vehicle | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehiculos")
    .update({
      matricula: updates.matricula,
      marca: updates.marca,
      modelo: updates.modelo,
      ano: updates.año,
      cliente_id: updates.clienteId,
    })
    .eq("id", id)
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .single()

  if (error) {
    console.error("Error updating vehicle:", error)
    return null
  }

  return {
    id: data.id,
    matricula: data.matricula,
    marca: data.marca,
    modelo: data.modelo,
    año: data.ano,
    clienteId: data.cliente_id,
    nombreDueño: data.clientes?.nombre,
    telefono: data.clientes?.telefono,
    email: data.clientes?.email,
    createdAt: data.created_at,
  }
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("vehiculos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting vehicle:", error)
    return false
  }

  return true
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching vehicle:", error)
    return null
  }

  return {
    id: data.id,
    matricula: data.matricula,
    marca: data.marca,
    modelo: data.modelo,
    año: data.ano,
    clienteId: data.cliente_id,
    nombreDueño: data.clientes?.nombre,
    telefono: data.clientes?.telefono,
    email: data.clientes?.email,
    createdAt: data.created_at,
  }
}

export async function searchVehicles(query: string): Promise<Vehicle[]> {
  const supabase = createClient()
  const lowerQuery = query.toLowerCase()
  
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .or(`matricula.ilike.%${lowerQuery}%,marca.ilike.%${lowerQuery}%,modelo.ilike.%${lowerQuery}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching vehicles:", error)
    return []
  }

  return (data || []).map((v) => ({
    id: v.id,
    matricula: v.matricula,
    marca: v.marca,
    modelo: v.modelo,
    año: v.ano,
    clienteId: v.cliente_id,
    nombreDueño: v.clientes?.nombre,
    telefono: v.clientes?.telefono,
    email: v.clientes?.email,
    createdAt: v.created_at,
  }))
}

export async function getVehiclesByCliente(clienteId: string): Promise<Vehicle[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      clientes (
        nombre,
        telefono,
        email
      )
    `)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles by cliente:", error)
    return []
  }

  return (data || []).map((v) => ({
    id: v.id,
    matricula: v.matricula,
    marca: v.marca,
    modelo: v.modelo,
    año: v.ano,
    clienteId: v.cliente_id,
    nombreDueño: v.clientes?.nombre,
    telefono: v.clientes?.telefono,
    email: v.clientes?.email,
    createdAt: v.created_at,
  }))
}

// Service functions
export interface ServiceWithCliente extends Service {
  clienteId?: string
}

export async function getServices(): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching services:", error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    vehicleId: s.vehiculo_id,
    clienteId: s.cliente_id,
    fecha: s.fecha,
    kilometraje: s.kilometraje,
    servicios: s.servicios_realizados,
    tipoAceite: s.tipo_aceite as TipoAceite | undefined,
    observaciones: s.observaciones,
    costo: parseFloat(s.costo),
    mecanico: s.mecanico,
    estado: s.estado as "En Proceso" | "Finalizado",
    createdAt: s.created_at,
  }))
}

export async function saveService(
  service: Omit<Service, "id" | "createdAt">
): Promise<Service | null> {
  const supabase = createClient()
  
  // Calcular próximo cambio de aceite si aplica
  let proximoCambioAceite = null
  if (service.tipoAceite && service.servicios.includes("Cambio de aceite")) {
    const duraciones = {
      Mineral: 5000,
      "Semi-sintético": 8000,
      Sintético: 10000,
    }
    proximoCambioAceite = service.kilometraje + duraciones[service.tipoAceite]
  }

  const { data: vehicleData } = await supabase
    .from("vehiculos")
    .select("cliente_id")
    .eq("id", service.vehicleId)
    .single()

  const { data, error } = await supabase
    .from("servicios")
    .insert({
      vehiculo_id: service.vehicleId,
      cliente_id: vehicleData?.cliente_id,
      fecha: service.fecha,
      kilometraje: service.kilometraje,
      servicios_realizados: service.servicios,
      tipo_aceite: service.tipoAceite,
      proximo_cambio_aceite: proximoCambioAceite,
      mecanico: service.mecanico,
      observaciones: service.observaciones,
      costo: service.costo,
      estado: service.estado,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving service:", error)
    return null
  }

  return {
    id: data.id,
    vehicleId: data.vehiculo_id,
    clienteId: data.cliente_id,
    fecha: data.fecha,
    kilometraje: data.kilometraje,
    servicios: data.servicios_realizados,
    tipoAceite: data.tipo_aceite as TipoAceite | undefined,
    observaciones: data.observaciones,
    costo: parseFloat(data.costo),
    mecanico: data.mecanico,
    estado: data.estado as "En Proceso" | "Finalizado",
    createdAt: data.created_at,
  }
}

export async function updateService(
  id: string,
  updates: Partial<Service>
): Promise<Service | null> {
  const supabase = createClient()
  
  const updateData: any = {}
  if (updates.vehicleId) updateData.vehiculo_id = updates.vehicleId
  if (updates.fecha) updateData.fecha = updates.fecha
  if (updates.kilometraje !== undefined) updateData.kilometraje = updates.kilometraje
  if (updates.servicios) updateData.servicios_realizados = updates.servicios
  if (updates.tipoAceite !== undefined) updateData.tipo_aceite = updates.tipoAceite
  if (updates.observaciones !== undefined) updateData.observaciones = updates.observaciones
  if (updates.costo !== undefined) updateData.costo = updates.costo
  if (updates.mecanico) updateData.mecanico = updates.mecanico
  if (updates.estado) updateData.estado = updates.estado

  const { data, error } = await supabase
    .from("servicios")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating service:", error)
    return null
  }

  return {
    id: data.id,
    vehicleId: data.vehiculo_id,
    clienteId: data.cliente_id,
    fecha: data.fecha,
    kilometraje: data.kilometraje,
    servicios: data.servicios_realizados,
    tipoAceite: data.tipo_aceite as TipoAceite | undefined,
    observaciones: data.observaciones,
    costo: parseFloat(data.costo),
    mecanico: data.mecanico,
    estado: data.estado as "En Proceso" | "Finalizado",
    createdAt: data.created_at,
  }
}

export async function deleteService(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("servicios").delete().eq("id", id)

  if (error) {
    console.error("Error deleting service:", error)
    return false
  }

  return true
}

export async function getServicesByVehicle(vehicleId: string): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("vehiculo_id", vehicleId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching services by vehicle:", error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    vehicleId: s.vehiculo_id,
    clienteId: s.cliente_id,
    fecha: s.fecha,
    kilometraje: s.kilometraje,
    servicios: s.servicios_realizados,
    tipoAceite: s.tipo_aceite as TipoAceite | undefined,
    observaciones: s.observaciones,
    costo: parseFloat(s.costo),
    mecanico: s.mecanico,
    estado: s.estado as "En Proceso" | "Finalizado",
    createdAt: s.created_at,
  }))
}

export async function getServicesByCliente(clienteId: string): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching services by cliente:", error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    vehicleId: s.vehiculo_id,
    clienteId: s.cliente_id,
    fecha: s.fecha,
    kilometraje: s.kilometraje,
    servicios: s.servicios_realizados,
    tipoAceite: s.tipo_aceite as TipoAceite | undefined,
    observaciones: s.observaciones,
    costo: parseFloat(s.costo),
    mecanico: s.mecanico,
    estado: s.estado as "En Proceso" | "Finalizado",
    createdAt: s.created_at,
  }))
}

export async function getServicesByDateRange(
  startDate: string,
  endDate: string
): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .gte("fecha", startDate)
    .lte("fecha", endDate)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching services by date range:", error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    vehicleId: s.vehiculo_id,
    clienteId: s.cliente_id,
    fecha: s.fecha,
    kilometraje: s.kilometraje,
    servicios: s.servicios_realizados,
    tipoAceite: s.tipo_aceite as TipoAceite | undefined,
    observaciones: s.observaciones,
    costo: parseFloat(s.costo),
    mecanico: s.mecanico,
    estado: s.estado as "En Proceso" | "Finalizado",
    createdAt: s.created_at,
  }))
}

export const supabaseStorage = {
  // Cliente methods
  getClientes,
  saveCliente,
  updateCliente,
  deleteCliente,
  getClienteById,
  searchClientes,
  
  // Vehicle methods
  getVehicles,
  saveVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  searchVehicles,
  getVehiclesByCliente,
  
  // Service methods
  getServices,
  saveService,
  updateService,
  deleteService,
  getServicesByVehicle,
  getServicesByCliente,
  getServicesByDateRange,
}
