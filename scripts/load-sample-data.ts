import { saveVehicle, saveService } from "../lib/storage"

console.log("[v0] Iniciando carga de datos de ejemplo...")

// Datos de vehículos de ejemplo
const sampleVehicles = [
  {
    plate: "SAA1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blanco",
    ownerName: "Juan Pérez",
    ownerPhone: "099 123 456",
    ownerEmail: "juan.perez@email.com",
  },
  {
    plate: "SBB5678",
    brand: "Chevrolet",
    model: "Onix",
    year: 2019,
    color: "Gris",
    ownerName: "María González",
    ownerPhone: "098 765 432",
    ownerEmail: "maria.gonzalez@email.com",
  },
  {
    plate: "SCC9012",
    brand: "Volkswagen",
    model: "Gol",
    year: 2021,
    color: "Negro",
    ownerName: "Carlos Rodríguez",
    ownerPhone: "097 234 567",
    ownerEmail: "carlos.rodriguez@email.com",
  },
  {
    plate: "SDD3456",
    brand: "Ford",
    model: "Ranger",
    year: 2018,
    color: "Azul",
    ownerName: "Ana Martínez",
    ownerPhone: "096 345 678",
    ownerEmail: "ana.martinez@email.com",
  },
  {
    plate: "SEE7890",
    brand: "Fiat",
    model: "Cronos",
    year: 2022,
    color: "Rojo",
    ownerName: "Pedro Silva",
    ownerPhone: "095 456 789",
    ownerEmail: "pedro.silva@email.com",
  },
  {
    plate: "SFF2345",
    brand: "Renault",
    model: "Sandero",
    year: 2020,
    color: "Blanco",
    ownerName: "Laura Fernández",
    ownerPhone: "094 567 890",
    ownerEmail: "laura.fernandez@email.com",
  },
  {
    plate: "SGG6789",
    brand: "Nissan",
    model: "Kicks",
    year: 2021,
    color: "Plateado",
    ownerName: "Roberto Díaz",
    ownerPhone: "093 678 901",
    ownerEmail: "roberto.diaz@email.com",
  },
  {
    plate: "SHH0123",
    brand: "Peugeot",
    model: "208",
    year: 2019,
    color: "Gris Oscuro",
    ownerName: "Sofía López",
    ownerPhone: "092 789 012",
    ownerEmail: "sofia.lopez@email.com",
  },
  {
    plate: "SII4567",
    brand: "Honda",
    model: "Civic",
    year: 2020,
    color: "Blanco Perla",
    ownerName: "Diego Ramírez",
    ownerPhone: "091 890 123",
    ownerEmail: "diego.ramirez@email.com",
  },
  {
    plate: "SJJ8901",
    brand: "Hyundai",
    model: "Tucson",
    year: 2022,
    color: "Negro",
    ownerName: "Valentina Torres",
    ownerPhone: "099 901 234",
    ownerEmail: "valentina.torres@email.com",
  },
]

console.log(`[v0] Cargando ${sampleVehicles.length} vehículos...`)

// Guardar vehículos
const vehicleIds: string[] = []
sampleVehicles.forEach((vehicle, index) => {
  const id = saveVehicle(vehicle)
  vehicleIds.push(id)
  console.log(`[v0] Vehículo ${index + 1}/${sampleVehicles.length} guardado: ${vehicle.plate}`)
})

// Datos de servicios de ejemplo
const serviceTypes = [
  "Cambio de aceite",
  "Filtro de aire",
  "Filtro de combustible",
  "Filtro de habitáculo",
  "Alineación",
  "Balanceo",
  "Rotación de neumáticos",
  "Tren delantero",
  "Frenos",
]

const mechanics = ["Juan Rodríguez", "Carlos Méndez", "Pedro Suárez", "Diego Fernández"]

const notes = [
  "Servicio completo realizado",
  "Cliente solicita revisión en 6 meses",
  "Se detectó desgaste en pastillas de freno",
  "Neumáticos en buen estado",
  "Se recomienda cambio de batería pronto",
  "Todo en orden",
  "Se realizó limpieza de inyectores",
  "Cliente satisfecho con el servicio",
]

console.log("[v0] Generando servicios de ejemplo...")

// Generar 30 servicios aleatorios en los últimos 90 días
const sampleServices = []
const now = new Date()

for (let i = 0; i < 30; i++) {
  // Fecha aleatoria en los últimos 90 días
  const daysAgo = Math.floor(Math.random() * 90)
  const serviceDate = new Date(now)
  serviceDate.setDate(serviceDate.getDate() - daysAgo)
  serviceDate.setHours(8 + Math.floor(Math.random() * 9), 0, 0, 0) // Entre 8am y 5pm

  // Seleccionar vehículo aleatorio
  const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)]

  // Seleccionar 1-4 tipos de servicio aleatorios
  const numServices = 1 + Math.floor(Math.random() * 4)
  const selectedServices: string[] = []
  const shuffled = [...serviceTypes].sort(() => 0.5 - Math.random())
  for (let j = 0; j < numServices; j++) {
    selectedServices.push(shuffled[j])
  }

  // Kilometraje aleatorio entre 20,000 y 200,000
  const mileage = 20000 + Math.floor(Math.random() * 180000)

  // Costo aleatorio entre $1,500 y $8,000
  const cost = 1500 + Math.floor(Math.random() * 6500)

  // Mecánico aleatorio
  const mechanic = mechanics[Math.floor(Math.random() * mechanics.length)]

  // Nota aleatoria
  const note = notes[Math.floor(Math.random() * notes.length)]

  sampleServices.push({
    vehicleId,
    serviceDate: serviceDate.toISOString(),
    serviceTypes: selectedServices,
    mileage,
    cost,
    mechanic,
    notes: note,
  })
}

// Ordenar servicios por fecha (más recientes primero)
sampleServices.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

console.log(`[v0] Guardando ${sampleServices.length} servicios...`)

// Guardar servicios
sampleServices.forEach((service, index) => {
  saveService(service)
  console.log(`[v0] Servicio ${index + 1}/${sampleServices.length} guardado`)
})

console.log("[v0] ¡Carga de datos completada exitosamente!")
console.log(`[v0] Total: ${vehicleIds.length} vehículos y ${sampleServices.length} servicios`)
console.log("[v0] Recarga la página para ver los datos")
