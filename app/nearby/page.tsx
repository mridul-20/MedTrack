"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPinIcon, SearchIcon, PhoneIcon, ClockIcon,
  StarIcon, NavigationIcon, Loader2Icon
} from "lucide-react"

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nearby Healthcare Services</h1>

      {isLoading ? (
        <Card className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Locating nearby services...</p>
            <p className="text-muted-foreground mt-2">Please wait while we find healthcare services near you</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                className="pl-9"
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

          {/* Tabs */}
          <Tabs defaultValue="pharmacies" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
            </TabsList>

            {/* Pharmacies */}
            <TabsContent value="pharmacies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPharmacies.length > 0 ? (
                  filteredPharmacies.map((pharmacy) => (
                    <Card key={pharmacy.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{pharmacy.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {pharmacy.address}
                            </CardDescription>
                          </div>
                          <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-sm font-medium">
                            {pharmacy.distance.toFixed(1)} mi
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{pharmacy.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{pharmacy.hours}</span>
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${pharmacy.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {pharmacy.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 mr-2 text-amber-500" />
                            <span>{pharmacy.rating}/5.0</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" className="flex-1">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              const query = encodeURIComponent(`${pharmacy.name}, ${pharmacy.address}`)
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank")
                            }}
                          >
                            <NavigationIcon className="h-4 w-4 mr-2" />
                            Directions
                          </Button>

                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground mb-2">No pharmacies found</p>
                    <p className="text-sm text-muted-foreground">
                      Try searching with different terms or adjusting your filters
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Doctors */}
            <TabsContent value="doctors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <Card key={doctor.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{doctor.name}</CardTitle>
                            <CardDescription className="mt-1">Doctor</CardDescription>
                          </div>
                          <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-sm font-medium">
                            {doctor.distance.toFixed(1)} mi
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{doctor.address}</span>
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{doctor.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{doctor.hours}</span>
                            <span
                              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${doctor.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                            >
                              {doctor.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 mr-2 text-amber-500" />
                            <span>{doctor.rating}/5.0</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" className="flex-1">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              const query = encodeURIComponent(`${doctor.name}, ${doctor.address}`) // or doctor.name + address
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank")
                            }}
                          >
                            <NavigationIcon className="h-4 w-4 mr-2" />
                            Directions
                          </Button>

                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground mb-2">No doctors found</p>
                    <p className="text-sm text-muted-foreground">
                      Try searching with different terms or adjusting your filters
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
