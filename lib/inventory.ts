import { supabase } from './supabase'

type Medicine = {
  name: string
  expiry_date: string // or Date, depending on your format
}

export const addMedicineToInventory = async ({ name, expiry_date }: Medicine) => {
  const { data, error } = await supabase
    .from('inventory') // your table name
    .insert([
      {
        name,
        expiry_date,
      },
    ])

  if (error) {
    console.error("Supabase error:", error)
    return { success: false }
  }

  return { success: true, data }
}
