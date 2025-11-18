import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowRight,
  BellRing,
  CameraIcon,
  CheckCircle2,
  Clock,
  Cpu,
  HeartPulseIcon,
  Layers,
  MapPinIcon,
  MessageSquareIcon,
  PillIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

const featureShowcase = [
  {
    title: "Scan & Detect",
    description: "OCR-powered capture that recognizes medicines, dosages and refill reminders automatically.",
    cta: { label: "Start scanning", href: "/scan" },
    icon: CameraIcon,
  },
  {
    title: "Smart Inventory",
    description: "A living cabinet connected to alerts, AI recommendations and refill planning.",
    cta: { label: "Open inventory", href: "/inventory" },
    icon: PillIcon,
  },
  {
    title: "Expiry Guardian",
    description: "Real-time notifications before medicines expire with seamless replacements.",
    cta: { label: "Track expiry", href: "/expiry" },
    icon: Clock,
  },
]

const workflow = [
  { title: "Capture or add a medicine", detail: "Scan a label or upload a prescription in seconds." },
  { title: "Let MediTrack organize it", detail: "AI enriches details, checks interactions and stores history." },
  { title: "Stay on top of care", detail: "Receive smart nudges for dosage, refills, expiries and doctor visits." },
]

const stats = [
  { label: "Medicines tracked", value: "120K+" },
  { label: "Care reminders sent", value: "3.2M" },
  { label: "Avg. time saved", value: "6 hrs/mo" },
  { label: "Cities covered", value: "85+" },
]

const testimonials = [
  {
    quote:
      "MediTrack keeps my parents' medicines synced across devices and warns us before anything runs out. It feels like having a digital caregiver.",
    name: "Ananya Sharma",
    role: "Primary caregiver",
  },
  {
    quote:
      "As a physician, I recommend MediTrack to chronic patients. The adherence nudges and AI insights are practical and beautifully designed.",
    name: "Dr. Karan Patel",
    role: "Family physician",
  },
]

const signals = [
  { icon: ShieldCheck, text: "HIPAA-grade encryption" },
  { icon: Cpu, text: "On-device AI for privacy" },
  { icon: BellRing, text: "Adaptive reminders" },
  { icon: Layers, text: "Syncs across devices" },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      </div>

      <main className="relative z-10">
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-white">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Smarter care, fewer worries
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Your interactive command center for every medicine you trust.
              </h1>
              <p className="text-lg text-white/70">
                MediTrack brings scanning, inventory, AI health coaching and nearby care discovery into one immersive
                workspace—so your family always feels prepared.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 bg-white text-slate-900 hover:bg-slate-200">
                <Link href="/scan">
                  Launch MediTrack
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/assistant">Talk to Health Assistant</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {signals.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-emerald-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="absolute -top-14 right-10 hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 shadow-2xl backdrop-blur lg:flex">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-200">Live Reminder</p>
                  <p>Vitamin D - 1 capsule at 9:00 PM</p>
                </div>
              </div>
              <div className="absolute -bottom-10 left-8 hidden rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white/80 shadow-2xl backdrop-blur lg:flex">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-200">Nearby Care</p>
                  <p>Pulse Pharmacy · 450m • Open now</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">Live Coverage</h3>
              <p className="text-sm text-white/70">
                A daily overview of your medicine cabinet with adherence, risk alerts and next best actions.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {featureShowcase.map((feature) => (
                  <Card
                    key={feature.title}
                    className="group border-white/10 bg-white/5 text-white shadow-lg shadow-slate-950/40 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-5 w-5 text-emerald-300" />
                        <CardTitle className="text-base text-white">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-white/60">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link
                        href={feature.cta.href}
                        className="inline-flex items-center gap-2 text-sm text-emerald-200 transition group-hover:gap-3"
                      >
                        {feature.cta.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-6 text-sm text-white/80">
                <p className="font-medium text-white">AI Insights</p>
                <p>
                  “Ibuprofen and Atenolol may interact. Consider spacing doses by 4 hours or consult a cardiologist.”
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-900/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white">
                <p className="text-3xl font-semibold text-emerald-200">{stat.value}</p>
                <p className="mt-1 text-sm uppercase tracking-wide text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">How it flows</p>
              <h2 className="text-3xl font-semibold text-white">From scan-to-care in minutes</h2>
            </div>
            <Button asChild className="bg-emerald-400 text-slate-900 hover:bg-emerald-300">
              <Link href="/recommendations">See personalized plan</Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {workflow.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-6 text-white transition hover:-translate-y-1 hover:border-emerald-300/40"
              >
                <div className="mb-4 flex items-center justify-between text-sm text-white/60">
                  <span>Step {index + 1}</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-white/70">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-900/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row">
            <div className="flex-1 space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Loved by caregivers</p>
              <h2 className="text-3xl font-semibold text-white">A calmer way to coordinate health</h2>
              <p className="text-white/70">
                Share access with family, sync across devices and give doctors the clarity they need—without juggling
                spreadsheets or paper boxes.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
                  <div className="mb-2 flex items-center gap-3 text-white">
                    <HeartPulseIcon className="h-5 w-5 text-emerald-300" />
                    <p className="font-medium">AI wellness stories</p>
                  </div>
                  Predictive recommendations tuned to your habits and vitals.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
                  <div className="mb-2 flex items-center gap-3 text-white">
                    <MessageSquareIcon className="h-5 w-5 text-cyan-300" />
                    <p className="font-medium">Care team sharing</p>
                  </div>
                  Secure links for doctors, home nurses or loved ones.
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardDescription className="text-lg text-white">
                      “{testimonial.quote}”
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col items-start text-sm text-white/70">
                    <span className="font-semibold text-white">{testimonial.name}</span>
                    <span>{testimonial.role}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 p-8 text-slate-900 shadow-[0_30px_120px_rgba(15,118,110,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-900/70">
                  Ready in minutes
                </p>
                <h2 className="text-3xl font-semibold">
                  Build your proactive care cockpit—sync devices, import prescriptions and invite your family.
                </h2>
                <p>
                  MediTrack keeps everyone in the loop with adaptive reminders, AI monitoring and fast access to nearby
                  care services.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/nearby">Find services</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-white/30 text-slate-900 hover:bg-white/40">
                  <Link href="/recommendations">Get AI plan</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

