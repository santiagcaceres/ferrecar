import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { Service, Vehicle, Cliente } from '@/lib/storage'
import { TIPOS_ACEITE } from '@/lib/storage'
import { formatCurrency } from '@/lib/date-utils'

console.log('[v0] Inicializando Resend con API Key:', process.env.RESEND_API_KEY ? 'Configurada' : 'NO CONFIGURADA')
const resend = new Resend(process.env.RESEND_API_KEY)

async function generatePDFBuffer({
  service,
  vehicle,
  cliente,
}: { service: Service; vehicle: Vehicle; cliente: Cliente }): Promise<Buffer> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  // Colores de la marca
  const azulAncap = [21, 82, 127]
  const amarilloAncap = [253, 185, 19]

  // Header con logo y título
  doc.setFillColor(...azulAncap)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("FerreCar Service", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Comprobante de Servicio", 105, 30, { align: "center" })

  // Información del cliente
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DEL CLIENTE", 20, 55)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Nombre: ${cliente.nombre}`, 20, 65)
  doc.text(`Teléfono: ${cliente.telefono}`, 20, 72)
  doc.text(`Email: ${cliente.email}`, 20, 79)

  // Información del vehículo
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("DATOS DEL VEHÍCULO", 20, 95)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Matrícula: ${vehicle.matricula}`, 20, 105)
  doc.text(`Marca: ${vehicle.marca}`, 20, 112)
  doc.text(`Modelo: ${vehicle.modelo}`, 20, 119)
  doc.text(`Año: ${vehicle.año}`, 20, 126)

  // Información del servicio
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("DETALLE DEL SERVICIO", 20, 142)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date(service.fecha).toLocaleDateString("es-UY")}`, 20, 152)
  doc.text(`Kilometraje: ${service.kilometraje.toLocaleString()} km`, 20, 159)
  doc.text(`Mecánico: ${service.mecanico}`, 20, 166)

  // Servicios realizados
  doc.setFont("helvetica", "bold")
  doc.text("Servicios Realizados:", 20, 176)
  doc.setFont("helvetica", "normal")

  let yPos = 183
  service.servicios.forEach((serv) => {
    doc.text(`• ${serv}`, 25, yPos)
    yPos += 7
  })

  // Tipo de aceite si aplica
  if (service.tipoAceite) {
    const aceiteInfo = TIPOS_ACEITE[service.tipoAceite]
    doc.setFont("helvetica", "bold")
    doc.text(`Tipo de Aceite: ${aceiteInfo.label}`, 25, yPos)
    yPos += 7
  }

  // Próximo cambio de aceite
  if (service.proximoCambioKm) {
    yPos += 5
    doc.setFillColor(...amarilloAncap)
    doc.rect(18, yPos - 5, 174, 15, "F")
    doc.setTextColor(...azulAncap)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`⚠ Próximo cambio de aceite: ${service.proximoCambioKm.toLocaleString()} km`, 105, yPos + 4, {
      align: "center",
    })
    yPos += 20
  } else {
    yPos += 10
  }

  // Observaciones
  if (service.observaciones) {
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Observaciones:", 20, yPos)
    doc.setFont("helvetica", "normal")
    const splitObservaciones = doc.splitTextToSize(service.observaciones, 170)
    doc.text(splitObservaciones, 20, yPos + 7)
    yPos += 7 + splitObservaciones.length * 7
  }

  // Total a pagar
  yPos += 10
  doc.setFillColor(...azulAncap)
  doc.rect(0, yPos, 210, 20, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`TOTAL: ${formatCurrency(service.costo)}`, 105, yPos + 12, { align: "center" })

  // Footer
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Gracias por confiar en FerreCar Service", 105, 280, { align: "center" })
  doc.text("WhatsApp: 092 524 829 - contacto@ferrecar.com.uy", 105, 286, { align: "center" })

  // Retornar como buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

export async function POST(request: Request) {
  try {
    console.log('[v0] Endpoint de notificación llamado')
    const body = await request.json()
    console.log('[v0] Datos recibidos:', { 
      hasService: !!body.service, 
      hasVehicle: !!body.vehicle, 
      hasCliente: !!body.cliente,
      clienteEmail: body.cliente?.email 
    })
    
    const { service, vehicle, cliente } = body as { service: Service; vehicle: Vehicle; cliente: Cliente }

    if (!service || !vehicle || !cliente) {
      console.log('[v0] Error: Faltan datos necesarios')
      return NextResponse.json({ error: 'Faltan datos necesarios' }, { status: 400 })
    }

    console.log('[v0] Generando PDF...')
    // Generar PDF como buffer
    const pdfBuffer = await generatePDFBuffer({ service, vehicle, cliente })
    console.log('[v0] PDF generado, tamaño:', pdfBuffer.length, 'bytes')

    // Construir lista de servicios realizados
    const serviciosRealizados = service.servicios.join(', ')
    
    // Información del próximo cambio de aceite
    let proximoCambioInfo = ''
    if (service.proximoCambioKm) {
      proximoCambioInfo = `\n\n⚠️ IMPORTANTE: Próximo cambio de aceite recomendado a los ${service.proximoCambioKm.toLocaleString()} km`
    }

    console.log('[v0] Intentando enviar email a:', cliente.email)
    const { data, error } = await resend.emails.send({
      from: 'FerreCar Service <contacto@ferrecarservice.com>',
      to: [cliente.email],
      subject: `Su vehículo ${vehicle.marca} ${vehicle.modelo} está listo para retirar`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #15527F; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .vehicle-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .services-list { margin: 15px 0; }
              .services-list li { margin: 5px 0; }
              .alert-box { background-color: #FDB913; color: #15527F; padding: 15px; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { background-color: #f5f5f5; padding: 20px; text-align: center; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FerreCar Service</h1>
            </div>
            <div class="content">
              <h2>Estimado/a ${cliente.nombre},</h2>
              <p>Nos complace informarle que su vehículo <strong>${vehicle.marca} ${vehicle.modelo}</strong> (Matrícula: ${vehicle.matricula}) está listo para ser retirado.</p>
              
              <div class="vehicle-info">
                <h3>Servicios Realizados:</h3>
                <ul class="services-list">
                  ${service.servicios.map(s => `<li>${s}${s === 'Cambio de aceite' && service.tipoAceite ? ` - ${service.tipoAceite}` : ''}</li>`).join('')}
                </ul>
                ${service.observaciones ? `<p><strong>Observaciones:</strong> ${service.observaciones}</p>` : ''}
              </div>

              ${service.proximoCambioKm ? `
              <div class="alert-box">
                ⚠️ IMPORTANTE: Próximo cambio de aceite recomendado a los ${service.proximoCambioKm.toLocaleString()} km
              </div>
              ` : ''}

              <p><strong>Total del servicio:</strong> ${formatCurrency(service.costo)}</p>
              
              <p>Adjunto encontrará la factura detallada del servicio realizado.</p>
            </div>
            <div class="footer">
              <p><strong>FerreCar Service</strong></p>
              <p>WhatsApp: 092 524 829</p>
              <p>Email: contacto@ferrecar.com.uy</p>
              <p>Gracias por confiar en nosotros</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `Factura-${vehicle.matricula}-${service.fecha}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error('[v0] Error enviando email:', error)
      return NextResponse.json({ error: 'Error al enviar el email', details: error }, { status: 500 })
    }

    console.log('[v0] Email enviado exitosamente:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Error en el endpoint:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}
