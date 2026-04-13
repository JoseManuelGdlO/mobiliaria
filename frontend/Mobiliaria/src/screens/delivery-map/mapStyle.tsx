/**
 * Estilo de mapa oscuro alineado con la UI de la app (fondos oscuros, carreteras discretas).
 * Compatible con Google Maps customMapStyle.
 */
export const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1e1b2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b8b4c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e1b2e' }, { weight: 2 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2540' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9bb0' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#9e9bb0' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#242038' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2a2540' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8a8799' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1f2d24' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3d3558' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e1b2e' }, { weight: 0.5 }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4a3d6b' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2d2640' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c4b8e8' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#3a3350' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#35304a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a2540' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#a8a3bc' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1a2e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5c7a9c' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
]
