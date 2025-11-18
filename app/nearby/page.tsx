"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPinIcon,
  SearchIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  NavigationIcon,
  Loader2Icon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"

export default function NearbyPage() {
  const [activeTab, setActiveTab] = useState("pharmacies")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("distance")
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [pharmacies, setPharmacies] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])

  const dummyPharmacies = [
    {
      id: 1,
      name: "Apollo Pharmacy",
      address: "KIIT Rd, opposite SBI, Patia",
      phone: "-",
      distance: 0.65,
      rating: 3.7,
      hours: "7:00 AM - 10:00 PM",
      isOpen: false,
    },
    {
      id: 2,
      name: "KIMS Medicine Store",
      address: "Chandaka Industrial Estate, K I I T University, Patia",
      phone: "-",
      distance: 1.0,
      rating: 3.9,
      hours: "Open 24 Hours",
      isOpen: true,
    },
    {
      id: 3,
      name: "Pradyumna Bal Hospital Pharmacy",
      address: "Chandaka Industrial Estate, K I I T University, Patia",
      phone: "-",
      distance: 1.3,
      rating: 4.4,
      hours: "Open 24 Hours",
      isOpen: true,
    },
    {
      id: 4,
      name: "Arati Pharma",
      address: "9R3G+9FJ, Patia",
      phone: "-",
      distance: 0.5,
      rating: 2.0,
      hours: "8:00 AM - 9:00 PM",
      isOpen: false,
    },
    {
      id: 5,
      name: "Aditya Pharma Care",
      address: "KIIT Rd, Patia",
      phone: "-",
      distance: 0.16,
      rating: 3.8,
      hours: "8:00 AM - 10:00 PM",
      isOpen: false,
    },
  ]

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      setUserLocation({ lat, lng })

      const radius = 3000 // in meters

      const overpassOrQuery = (filters: { key: string; value: string }[]) => {
        const queryParts = filters.map(f => `
          node["${f.key}"="${f.value}"](around:${radius},${lat},${lng});
          way["${f.key}"="${f.value}"](around:${radius},${lat},${lng});
          relation["${f.key}"="${f.value}"](around:${radius},${lat},${lng});
        `).join("\n")

        return `
          [out:json][timeout:25];
          (
            ${queryParts}
          );
          out center;
        `
      }

      const fetchOverpassData = async (query: string) => {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: query,
        })
        const data = await response.json()

        return data.elements.map((el: any) => ({
          id: el.id,
          name: el.tags?.name || "Unnamed",
          address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || "Address not available",
          phone: el.tags?.["phone"] || el.tags?.["contact:phone"] || "Phone not available",
          distance: Math.random() * 3,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          hours: el.tags?.["opening_hours"] || "Opening hours not available",
          isOpen: true
        }))
      }

      try {
        const pharmacyQuery = overpassOrQuery([
          { key: "amenity", value: "pharmacy" },
          { key: "shop", value: "chemist" },
          { key: "healthcare", value: "pharmacy" },
          { key: "healthcare", value: "Medical-Shop" },
          { key: "shop", value: "Medical-shop" },
          { key: "healthcare", value: "Homeopathy" },
        ])

        const doctorQuery = overpassOrQuery([
          { key: "amenity", value: "doctors" },
          { key: "healthcare", value: "doctor" },
        ])

        const [pharmacyResults, doctorResults] = await Promise.all([
          fetchOverpassData(pharmacyQuery),
          fetchOverpassData(doctorQuery),
        ])

        // Fallback to dummy if API gives nothing
        setPharmacies(pharmacyResults.length ? pharmacyResults : dummyPharmacies)
        setDoctors(doctorResults)
      } catch (err) {
        console.error("Error fetching from Overpass API:", err)
        setPharmacies(dummyPharmacies)
        setDoctors([])
      }

      setIsLoading(false)
    }, () => {
      alert("Unable to get your location. Please allow location access.")
      setPharmacies(dummyPharmacies)
      setIsLoading(false)
    })
  }, [])

  const filteredPharmacies = pharmacies
    .filter((pharmacy) =>
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => filterType === "distance" ? a.distance - b.distance : b.rating - a.rating)

  const filteredDoctors = doctors
    .filter((doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => filterType === "distance" ? a.distance - b.distance : b.rating - a.rating)

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">Local network</p>
          <h1 className="text-4xl font-semibold text-white">Nearby Healthcare Services</h1>
          <p className="text-white/70">
            Compare pharmacies and on-call doctors around you—filter by distance or rating and launch directions instantly.
          </p>
        </div>

        {isLoading ? (
          <Card className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2Icon className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-300" />
              <p className="text-lg font-medium text-white">Locating nearby services...</p>
              <p className="mt-2 text-white/60">Please wait while we find healthcare services near you</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Search by name or location..."
                  className="pl-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="pharmacies" onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-white/5 text-white/70">
                <TabsTrigger value="pharmacies" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  Pharmacies
                </TabsTrigger>
                <TabsTrigger value="doctors" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  Doctors
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pharmacies">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {filteredPharmacies.length > 0 ? (
                    filteredPharmacies.map((pharmacy) => (
                      <Card key={pharmacy.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white">{pharmacy.name}</CardTitle>
                              <CardDescription className="mt-1 flex items-center text-white/70">
                                <MapPinIcon className="mr-1 h-3 w-3" />
                                {pharmacy.address}
                              </CardDescription>
                            </div>
                            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                              {pharmacy.distance.toFixed(1)} mi
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 text-sm text-white/80">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <PhoneIcon className="mr-2 h-4 w-4 text-white/50" />
                              <span>{pharmacy.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="mr-2 h-4 w-4 text-white/50" />
                              <span>{pharmacy.hours}</span>
                              <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                  pharmacy.isOpen ? "bg-emerald-400/20 text-emerald-100" : "bg-red-400/20 text-red-100"
                                }`}
                              >
                                {pharmacy.isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="mr-2 h-4 w-4 text-amber-400" />
                              <span>{pharmacy.rating}/5.0</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex w-full gap-2">
                            <Button variant="outline" className="flex-1">
                              <PhoneIcon className="mr-2 h-4 w-4" />
                              Call
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => {
                                const query = encodeURIComponent(`${pharmacy.name}, ${pharmacy.address}`)
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank")
                              }}
                            >
                              <NavigationIcon className="mr-2 h-4 w-4" />
                              Directions
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/70">
                      No pharmacies found. Try different keywords.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="doctors">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <Card key={doctor.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white">{doctor.name}</CardTitle>
                              <CardDescription className="mt-1 text-white/70">Doctor</CardDescription>
                            </div>
                            <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                              {doctor.distance.toFixed(1)} mi
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 text-sm text-white/80">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <MapPinIcon className="mr-2 h-4 w-4 text-white/50" />
                              <span>{doctor.address}</span>
                            </div>
                            <div className="flex items-center">
                              <PhoneIcon className="mr-2 h-4 w-4 text-white/50" />
                              <span>{doctor.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="mr-2 h-4 w-4 text-white/50" />
                              <span>{doctor.hours}</span>
                              <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                  doctor.isOpen ? "bg-emerald-400/20 text-emerald-100" : "bg-red-400/20 text-red-100"
                                }`}
                              >
                                {doctor.isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <StarIcon className="mr-2 h-4 w-4 text-amber-400" />
                              <span>{doctor.rating}/5.0</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex w-full gap-2">
                            <Button variant="outline" className="flex-1">
                              <PhoneIcon className="mr-2 h-4 w-4" />
                              Call
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => {
                                const query = encodeURIComponent(`${doctor.name}, ${doctor.address}`)
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank")
                              }}
                            >
                              <NavigationIcon className="mr-2 h-4 w-4" />
                              Directions
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/70">
                      No doctors found. Try different keywords.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageShell>
  )
}
