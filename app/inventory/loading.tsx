import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="text-lg font-medium text-gray-600">Loading inventory...</p>
    </div>
  )
}
