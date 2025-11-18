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
import { PageShell } from "@/components/page-shell"

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
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Live cabinet</p>
            <h1 className="text-4xl font-semibold text-white">Medicine Inventory</h1>
            <p className="text-white/70">Filter, audit expiry risks, and keep all prescriptions synced.</p>
          </div>
          <Input
            placeholder="Search by medicine name..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-white/70">
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
                    <TableCell colSpan={5} className="py-10 text-center text-white/70">
                      <Loader2Icon className="mx-auto mb-3 h-6 w-6 animate-spin text-emerald-300" />
                      Loading medicines...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((med) => (
                    <TableRow key={med.id} className="border-white/5">
                      <TableCell className="font-semibold text-white">{med.name}</TableCell>
                      <TableCell className="text-white/80">{med.frequency || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(med.expiry_date)
                              ? "text-red-300 font-medium"
                              : isExpiringSoon(med.expiry_date)
                              ? "text-amber-200 font-medium"
                              : "text-white/80"
                          }
                        >
                          {med.expiry_date
                            ? new Date(`${med.expiry_date}T00:00:00`).toLocaleDateString("en-GB")
                            : "No expiry"}
                          {isExpired(med.expiry_date)
                            ? " · Expired"
                            : isExpiringSoon(med.expiry_date)
                            ? " · Expiring Soon"
                            : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/80">{med.quantity}</TableCell>
                      <TableCell className="text-white/80">{med.dosage}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-white/60">
                      No medicines found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
