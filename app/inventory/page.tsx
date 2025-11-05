"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2Icon } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const result = await supabase.from("medicines").select("*")
    console.log("Supabase result:", result)

    if (result.data) {
      setMedicines(result.data)
    } else {
      console.error("Error fetching data:", result.error)
    }

    setLoading(false)
  }

  const isExpired = (date: string) => {
    if (!date) return false
    return new Date(`${date}T00:00:00`) < new Date()
  }

  const isExpiringSoon = (date: string) => {
    if (!date) return false
    const d = new Date(`${date}T00:00:00`)
    const now = new Date()
    const soon = new Date()
    soon.setMonth(now.getMonth() + 3)
    return d >= now && d <= soon
  }

  const filtered = medicines.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Medicine Inventory</h1>
        <Input
          placeholder="Search by medicine name..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Dosage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2Icon className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading medicines...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.frequency || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(med.expiry_date)
                              ? "text-red-600 font-medium"
                              : isExpiringSoon(med.expiry_date)
                              ? "text-yellow-600 font-medium"
                              : ""
                          }
                        >
                          {med.expiry_date
                            ? new Date(`${med.expiry_date}T00:00:00`).toLocaleDateString("en-GB")
                            : "No expiry"}
                          {isExpired(med.expiry_date)
                            ? " (Expired)"
                            : isExpiringSoon(med.expiry_date)
                            ? " (Expiring Soon)"
                            : ""}
                        </span>
                      </TableCell>
                      <TableCell>{med.quantity}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No medicines found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
