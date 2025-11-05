// lib/addMedicine.ts
import { supabase } from './supabase'

export const addMedicineToInventory = async (medicine: {
  name: string
  expiry_date: string
  salt_composition: string
}) => {
  const { data, error } = await supabase.from('medicines').insert([medicine])

  if (error) {
    console.error('Error adding medicine:', error)
    return null
  }

  return data
}
