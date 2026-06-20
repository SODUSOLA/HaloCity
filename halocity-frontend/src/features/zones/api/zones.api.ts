import api from '@/shared/lib/api'

export async function fetchZonesList() {
  const { data } = await api.get('/zones')
  return data
}

export async function fetchZoneDetail(id: string) {
  const { data } = await api.get(`/zones/${id}`)
  return data
}
