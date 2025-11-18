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
import { PageShell } from "@/components/page-shell"

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
      return (
        <Badge className="flex items-center gap-1 border-red-500/30 bg-red-500/20 text-red-100">
          <XCircleIcon className="h-3 w-3" />
          Expired
        </Badge>
      )
    } else if (isExpiringSoon(expiry_date)) {
      return (
        <Badge className="flex items-center gap-1 border-amber-400/30 bg-amber-400/15 text-amber-100">
          <AlertTriangleIcon className="h-3 w-3" />
          Expiring Soon
        </Badge>
      )
    } else {
      return (
        <Badge className="flex items-center gap-1 border-emerald-400/30 bg-emerald-400/15 text-emerald-100">
          <CheckCircleIcon className="h-3 w-3" />
          Valid
        </Badge>
      )
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
    <PageShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Expiry radar</p>
          <h1 className="text-4xl font-semibold text-white">Expiry Tracking</h1>
          <p className="text-white/70">Categorize medicines by urgency and replace expiring doses in seconds.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-red-500/20 bg-red-500/10 text-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-100">
                <XCircleIcon className="h-5 w-5" />
                Expired
              </CardTitle>
              <CardDescription className="text-red-100/80">Medicines past their expiry date</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{expired.length}</p>
            </CardContent>
          </Card>

          <Card className="border-amber-400/20 bg-amber-400/10 text-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-100">
                <AlertTriangleIcon className="h-5 w-5" />
                Expiring Soon
              </CardTitle>
              <CardDescription className="text-amber-100/80">Expiring within 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{expiringSoon.length}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-400/20 bg-emerald-400/10 text-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-emerald-100">
                <CheckCircleIcon className="h-5 w-5" />
                Valid
              </CardTitle>
              <CardDescription className="text-emerald-100/80">Healthy stock, no action needed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{valid.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6 bg-white/5 text-white/70">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              All Medicines
            </TabsTrigger>
            <TabsTrigger value="expired" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Expired
            </TabsTrigger>
            <TabsTrigger value="expiring-soon" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Expiring Soon
            </TabsTrigger>
            <TabsTrigger value="valid" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Valid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ExpiryTable
              medicines={medicines}
              getStatusBadge={getStatusBadge}
              loading={loading}
              onReplaceClick={setSelectedMed}
              openDialog={setOpenDialog}
            />
          </TabsContent>
          <TabsContent value="expired">
            <ExpiryTable
              medicines={expired}
              getStatusBadge={getStatusBadge}
              loading={loading}
              emptyMessage="No expired medicines found."
              onReplaceClick={setSelectedMed}
              openDialog={setOpenDialog}
            />
          </TabsContent>
          <TabsContent value="expiring-soon">
            <ExpiryTable
              medicines={expiringSoon}
              getStatusBadge={getStatusBadge}
              loading={loading}
              emptyMessage="No medicines expiring soon."
              onReplaceClick={setSelectedMed}
              openDialog={setOpenDialog}
            />
          </TabsContent>
          <TabsContent value="valid">
            <ExpiryTable
              medicines={valid}
              getStatusBadge={getStatusBadge}
              loading={loading}
              emptyMessage="No valid medicines found."
              onReplaceClick={setSelectedMed}
              openDialog={setOpenDialog}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="glass-panel border-white/10 bg-slate-950/80">
            <DialogHeader>
              <DialogTitle className="text-white">Replace Medicine</DialogTitle>
            </DialogHeader>
            {selectedMed && (
              <div className="mt-4 space-y-4">
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
    </PageShell>
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
