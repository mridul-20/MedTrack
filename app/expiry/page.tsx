"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Medicine = {
  id: number
  name: string
  frequency: string
  expiry_date: string
  quantity: number
}

export default function ExpiryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("medicines").select("*")
    if (error) console.error("Error fetching data:", error)
    else setMedicines(data)
    setLoading(false)
  }

  const today = new Date()
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(today.getMonth() + 3)

  const isExpired = (date: string) => new Date(`${date}T00:00:00`) < today
  const isExpiringSoon = (date: string) => {
    const expiry = new Date(`${date}T00:00:00`)
    return expiry <= threeMonthsFromNow && expiry > today
  }

  const expired = medicines.filter((m) => isExpired(m.expiry_date))
  const expiringSoon = medicines.filter((m) => isExpiringSoon(m.expiry_date))
  const valid = medicines.filter((m) => !isExpired(m.expiry_date) && !isExpiringSoon(m.expiry_date))

  const getStatusBadge = (expiry_date: string) => {
    if (isExpired(expiry_date)) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircleIcon className="h-3 w-3" />Expired</Badge>
    } else if (isExpiringSoon(expiry_date)) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1"><AlertTriangleIcon className="h-3 w-3" />Expiring Soon</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1"><CheckCircleIcon className="h-3 w-3" />Valid</Badge>
    }
  }

  const handleUpdate = async () => {
    if (!selectedMed) return
    const { error } = await supabase
      .from("medicines")
      .update({
        name: selectedMed.name,
        expiry_date: selectedMed.expiry_date,
        quantity: selectedMed.quantity
      })
      .eq("id", selectedMed.id)

    if (error) {
      console.error("Update error:", error)
    } else {
      setOpenDialog(false)
      fetchMedicines()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expiry Tracking</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* ...Card components same as before... */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircleIcon className="h-5 w-5" />
              Expired
            </CardTitle>
            <CardDescription className="text-red-700">Medicines that have passed their expiry date</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-800">{expired.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5" />
              Expiring Soon
            </CardTitle>
            <CardDescription className="text-amber-700">Medicines expiring in the next 3 months</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-800">{expiringSoon.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              Valid
            </CardTitle>
            <CardDescription className="text-green-700">Medicines with valid expiry dates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-800">{valid.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Medicines</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="expiring-soon">Expiring Soon</TabsTrigger>
          <TabsTrigger value="valid">Valid</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ExpiryTable medicines={medicines} getStatusBadge={getStatusBadge} loading={loading} onReplaceClick={setSelectedMed} openDialog={setOpenDialog} />
        </TabsContent>
        <TabsContent value="expired">
          <ExpiryTable medicines={expired} getStatusBadge={getStatusBadge} loading={loading} emptyMessage="No expired medicines found." onReplaceClick={setSelectedMed} openDialog={setOpenDialog} />
        </TabsContent>
        <TabsContent value="expiring-soon">
          <ExpiryTable medicines={expiringSoon} getStatusBadge={getStatusBadge} loading={loading} emptyMessage="No medicines expiring soon." onReplaceClick={setSelectedMed} openDialog={setOpenDialog} />
        </TabsContent>
        <TabsContent value="valid">
          <ExpiryTable medicines={valid} getStatusBadge={getStatusBadge} loading={loading} emptyMessage="No valid medicines found." onReplaceClick={setSelectedMed} openDialog={setOpenDialog} />
        </TabsContent>
      </Tabs>

      {/* Replace Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Medicine</DialogTitle>
          </DialogHeader>
          {selectedMed && (
            <div className="space-y-4 mt-4">
              <Input
                value={selectedMed.name || ""}
                onChange={(e) => setSelectedMed({ ...selectedMed, name: e.target.value })}
                placeholder="Medicine name"
              />
              <Input
                type="date"
                value={selectedMed.expiry_date || ""}
                onChange={(e) => setSelectedMed({ ...selectedMed, expiry_date: e.target.value })}
              />
              <Input
                type="number"
                value={selectedMed.quantity ?? ""}
                onChange={(e) => setSelectedMed({ ...selectedMed, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Quantity"
              />
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ExpiryTableProps = {
  medicines: Medicine[]
  getStatusBadge: (expiry_date: string) => React.ReactNode
  emptyMessage?: string
  loading?: boolean
  onReplaceClick: (med: Medicine) => void
  openDialog: (v: boolean) => void
}

function ExpiryTable({ medicines, getStatusBadge, emptyMessage = "No medicines found.", loading = false, onReplaceClick, openDialog }: ExpiryTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">Loading...</TableCell>
                </TableRow>
              ) : medicines.length > 0 ? (
                medicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>{medicine.frequency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(`${medicine.expiry_date}T00:00:00`).toLocaleDateString("en-GB")}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(medicine.expiry_date)}</TableCell>
                    <TableCell>{medicine.quantity}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { onReplaceClick(medicine); openDialog(true); }}>
                        Replace
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
