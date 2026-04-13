# PRD: Moodboard Inteligente + Cotizacion Viva

## Objetivo
Convertir la renta de mobiliario en una experiencia premium guiada para acelerar cierres y elevar el ticket promedio.

## Alcance MVP
- Flujo "Diseña tu evento" con tipo de evento, estilo, invitados y presupuesto.
- Recomendaciones automáticas de mobiliario por estilo (`POST /recommendations/moodboard`).
- Cotización viva con desglose de subtotal, descuento, logística, IVA y total (`POST /quotes/live`).
- Guardado de borrador de diseño ligado a evento (`POST /events/:id/design-draft`).

## Personas objetivo
- Cliente final que necesita guía estética.
- Organizador profesional que busca velocidad de propuesta.
- Equipo comercial interno que requiere una herramienta de cierre visual.

## Criterios de aceptación MVP
1. El usuario puede generar una propuesta visual en menos de 60 segundos.
2. La propuesta devuelve al menos 5 sugerencias de mobiliario disponibles.
3. La cotización viva se recalcula y muestra desglose financiero.
4. El borrador puede guardarse con `eventId` existente o `0` para pre-venta.

## Definición de tracking
- `design_flow_opened`
- `design_recommendation_requested`
- `design_recommendation_succeeded`
- `live_quote_generated`
- `design_draft_saved`
- `design_flow_abandoned`

## KPIs de negocio (90 días)
- Cotización -> reserva confirmada.
- Ticket promedio por evento.
- Porcentaje de propuestas con al menos 1 upsell.
- Tiempo promedio desde primera propuesta hasta cierre.
- Satisfacción/NPS del flujo de diseño.

## Riesgos y mitigación
- Recomendaciones de baja calidad: ajustar catálogo de keywords y topes por estilo semanalmente.
- Fricción del flujo: mantener formulario corto y defaults prellenados.
- Diferencias de disponibilidad: priorizar inventario disponible por fecha en backend.
