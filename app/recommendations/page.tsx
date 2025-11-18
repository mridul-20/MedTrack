"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SearchIcon, PillIcon, HeartPulseIcon, Loader2Icon, CheckCircleIcon, InfoIcon } from 'lucide-react'
import { aiService } from "@/lib/ai-service"
import { PageShell } from "@/components/page-shell"

// Mock data for medicine inventory
const medicineInventory = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    expiryDate: "2025-12-31",
    quantity: 24,
    dosage: "1-2 tablets every 4-6 hours",
    uses: "Fever, headache, mild pain",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Antibiotic",
    expiryDate: "2024-10-15",
    quantity: 10,
    dosage: "1 capsule three times daily",
    uses: "Bacterial infections",
  },
  {
    id: 3,
    name: "Cetirizine 10mg",
    category: "Antihistamine",
    expiryDate: "2026-05-20",
    quantity: 30,
    dosage: "1 tablet daily",
    uses: "Allergies, hay fever, itching",
  },
  {
    id: 4,
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    expiryDate: "2025-08-10",
    quantity: 16,
    dosage: "1 tablet every 6-8 hours",
    uses: "Pain, inflammation, fever",
  },
  {
    id: 5,
    name: "Omeprazole 20mg",
    category: "Antacid",
    expiryDate: "2024-11-30",
    quantity: 14,
    dosage: "1 capsule daily before breakfast",
    uses: "Acid reflux, heartburn, stomach ulcers",
  },
]

type Recommendation = {
  medicine: string
  reason: string
  dosage: string
  alternatives?: string[]
  homeRemedies?: string[]
}

type AnalysisMeta = {
  possibleConditions: string[]
  selfCareAdvice: string[]
}

export default function RecommendationsPage() {
  const [symptoms, setSymptoms] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [activeTab, setActiveTab] = useState("symptoms")
  const [searchTerm, setSearchTerm] = useState("")
  const [analysisMeta, setAnalysisMeta] = useState<AnalysisMeta | null>(null)

  const filteredMedicines = medicineInventory.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.uses.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGetRecommendations = async () => {
    if (!symptoms.trim()) return

    setIsLoading(true)
    setAnalysisMeta(null)

    try {
      // Use our Gemini-based AI service to analyze symptoms
      const analysis = await aiService.analyzeSymptoms(symptoms, 35);
      
      const possibleConditions =
        analysis.possibleConditions && analysis.possibleConditions.length > 0
          ? analysis.possibleConditions
          : ["May help with symptoms"]
      const selfCareAdvice =
        analysis.selfCareAdvice && analysis.selfCareAdvice.length > 0
          ? analysis.selfCareAdvice
          : ["Rest well", "Stay hydrated", "Consult a healthcare professional if symptoms worsen"]

      // Transform the analysis into recommendations format
      const transformedRecommendations: Recommendation[] = analysis.recommendedMedicines.map((med, index) => {
        return {
          medicine: med,
          reason: possibleConditions[index % possibleConditions.length] || "May help with symptoms",
          dosage: "As directed on packaging",
          alternatives: analysis.recommendedMedicines.filter(m => m !== med).slice(0, 2),
          homeRemedies: selfCareAdvice.slice(0, 3)
        }
      });
      
      setRecommendations(transformedRecommendations);
      setAnalysisMeta({
        possibleConditions,
        selfCareAdvice,
      })
    } catch (error) {
      console.error("Error generating recommendations:", error)
      setRecommendations([])
      setAnalysisMeta(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200">AI guidance</p>
          <h1 className="text-4xl font-semibold text-white">Medicine Recommendations</h1>
          <p className="text-white/70">Describe symptoms or scan the cabinet to surface the safest next steps.</p>
        </div>

        <Tabs defaultValue="symptoms" onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white/5 text-white/70">
            <TabsTrigger value="symptoms" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              By Symptoms
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Search Medicines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <HeartPulseIcon className="h-5 w-5 text-emerald-300" />
                    Describe Your Symptoms
                  </CardTitle>
                  <CardDescription>
                    Tell us what you're experiencing to get personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Describe your symptoms in detail (e.g., headache, fever, sore throat)"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={6}
                      />
                    </div>

                    <Alert className="border-white/10 bg-white/5 text-white">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Important Note</AlertTitle>
                      <AlertDescription>
                        These recommendations are based on your symptoms and available medicines. Always consult a
                        healthcare professional for medical advice.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGetRecommendations} disabled={isLoading || !symptoms.trim()} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Get Recommendations"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <PillIcon className="h-5 w-5 text-cyan-300" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>Based on your symptoms and available medicines</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-white/70">
                      <Loader2Icon className="mb-4 h-12 w-12 animate-spin text-emerald-300" />
                      Analyzing your symptoms...
                    </div>
                  ) : recommendations ? (
                    recommendations.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {recommendations.map((rec, index) => (
                            <div key={index} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5 text-emerald-300" />
                                <h3 className="text-lg font-semibold text-white">{rec.medicine}</h3>
                              </div>
                              <div className="space-y-2 text-sm text-white/80">
                                <p>
                                  <span className="font-medium text-white">Why:</span> {rec.reason}
                                </p>
                                <p>
                                  <span className="font-medium text-white">Dosage:</span> {rec.dosage}
                                </p>

                                {rec.alternatives && rec.alternatives.length > 0 && (
                                  <div>
                                    <p className="font-medium text-white">Alternatives:</p>
                                    <ul className="list-disc space-y-1 pl-5">
                                      {rec.alternatives.map((alt, i) => (
                                        <li key={i}>{alt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {rec.homeRemedies && rec.homeRemedies.length > 0 && (
                                  <div>
                                    <p className="font-medium text-white">Home Remedies:</p>
                                    <ul className="list-disc space-y-1 pl-5">
                                      {rec.homeRemedies.map((remedy, i) => (
                                        <li key={i}>{remedy}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {analysisMeta && (
                          <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
                              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Possible conditions</p>
                              <ul className="mt-3 space-y-2 text-sm text-white/80">
                                {analysisMeta.possibleConditions.map((condition) => (
                                  <li key={condition} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                    <span>{condition}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
                              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Self-care advice</p>
                              <ul className="mt-3 space-y-2 text-sm text-white/80">
                                {analysisMeta.selfCareAdvice.map((tip) => (
                                  <li key={tip} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center text-white/70">
                        <p className="mb-2">No specific recommendations found</p>
                        <p className="text-sm">
                          We couldn't find suitable medicines in your inventory for these symptoms. Consider consulting a
                          healthcare professional.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="py-8 text-center text-white/70">
                      <p className="mb-2">No recommendations yet</p>
                      <p className="text-sm">
                        Describe your symptoms and click "Get Recommendations" to receive personalized suggestions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <SearchIcon className="h-5 w-5 text-cyan-300" />
                  Search Medicines
                </CardTitle>
                <CardDescription>Find medicines by name, category, or use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      placeholder="Search by name, category, or use..."
                      className="pl-11"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((medicine) => (
                        <Card key={medicine.id} className="border-white/10 bg-white/5">
                          <div className="flex flex-col p-5 text-sm text-white/80">
                            <h3 className="mb-2 text-lg font-semibold text-white">{medicine.name}</h3>
                            <p>
                              <span className="font-medium text-white">Category:</span> {medicine.category}
                            </p>
                            <p>
                              <span className="font-medium text-white">Uses:</span> {medicine.uses}
                            </p>
                            <p>
                              <span className="font-medium text-white">Dosage:</span> {medicine.dosage}
                            </p>
                            <p>
                              <span className="font-medium text-white">Quantity:</span> {medicine.quantity} remaining
                            </p>
                            <p>
                              <span className="font-medium text-white">Expires:</span>{" "}
                              {new Date(medicine.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/70">
                        No medicines found. Try different terms.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}

