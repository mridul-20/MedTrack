// lib/fetchInventory.ts
import { supabase } from './supabase'

export const fetchInventory = async () => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data
}
