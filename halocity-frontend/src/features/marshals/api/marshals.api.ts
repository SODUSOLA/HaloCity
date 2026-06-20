import api from '@/shared/lib/api'

export async function fetchMarshals() {
  const { data } = await api.get('/marshals')
  return data
}

export async function fetchActiveMarshals() {
  const { data } = await api.get('/marshals/active')
  return data
}

export async function fetchMarshalsByZone(zoneId: string) {
  const { data } = await api.get(`/marshals/zone/${zoneId}`)
  return data
}

export async function updateMarshalLocation(lat: number, lng: number) {
  const { data } = await api.patch('/marshals/location', { lat, lng })
  return data
}
