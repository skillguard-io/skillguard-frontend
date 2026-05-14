"use client"

import { useState } from "react"
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Github, 
  Search, 
  Lock,
  Mail,
  Code,
  Brain,
  FileText,
  KeyRound,
  MessageSquareWarning,
  Link2,
  EyeOff,
  Binary,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Flag {
  severidad: "HIGH" | "MEDIUM" | "LOW"
  categoria: string
  linea: number
  descripcion: string
  texto?: string
  decoded?: string
  url?: string
  explicacion?: string
}

interface ScanResult {
  score: number
  score_estatico: number
  score_semantico: number
  veredicto: string
  resumen: string
  flags_estaticos: Flag[]
  flags_semanticos: Flag[]
}

function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SkillGuard</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Analiza la seguridad de tus skills de IA antes de usarlos
            </p>
          </div>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}

function VerdictCard({ result }: { result: ScanResult }) {
  const getVerdictData = (score: number) => {
    if (score <= 30) {
      return {
        icon: ShieldCheck,
        title: "ESTÁS A SALVO",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        iconBg: "bg-success",
      }
    }
    if (score <= 60) {
      return {
        icon: ShieldAlert,
        title: "RIESGO DETECTADO",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        iconBg: "bg-warning",
      }
    }
    return {
      icon: ShieldX,
      title: "ALTO RIESGO",
      color: "text-danger",
      bgColor: "bg-danger/10",
      borderColor: "border-danger/20",
      iconBg: "bg-danger",
    }
  }

  const verdict = getVerdictData(result.score)
  const Icon = verdict.icon
  const totalFlags = result.flags_estaticos.length + result.flags_semanticos.length

  return (
    <Card className={`${verdict.bgColor} ${verdict.borderColor} border-2 shadow-lg`}>
      <CardContent className="pt-8 pb-8">
        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full ${verdict.iconBg} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon className="h-10 w-10 text-white" />
          </div>
          
          <h2 className={`text-2xl sm:text-3xl font-bold ${verdict.color} mb-2`}>
            {verdict.title}
          </h2>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${verdict.bgColor} border ${verdict.borderColor} mb-4`}>
            <span className="text-sm text-muted-foreground">Score de riesgo:</span>
            <span className={`text-2xl font-bold ${verdict.color}`}>{result.score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          
          <p className="text-muted-foreground max-w-xl leading-relaxed mb-6">
            {result.resumen}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border shadow-sm">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{totalFlags} flags detectados</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Estático: <strong>{result.score_estatico}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border shadow-sm">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Semántico: <strong>{result.score_semantico}</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LockedReportSection({ 
  result,
  analyzedUrl,
}: { 
  result: ScanResult
  analyzedUrl: string
}) {
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsValidEmail(emailRegex.test(value))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    validateEmail(value)
    setSendError(null)
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail) return

    setIsSending(true)
    setSendError(null)

    try {
      const response = await fetch("https://web-production-cf779.up.railway.app/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          url: analyzedUrl,
          score: result.score,
          veredicto: result.veredicto,
          resumen: result.resumen,
          total_flags: result.flags_estaticos.length + result.flags_semanticos.length,
          flags_estaticos: result.flags_estaticos,
          flags_semanticos: result.flags_semanticos,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      setIsSent(true)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Error al enviar el informe")
    } finally {
      setIsSending(false)
    }
  }

  const totalFlags = result.flags_estaticos.length + result.flags_semanticos.length

  // Success state
  if (isSent) {
    return (
      <div className="mt-8">
        <Card className="border-2 border-success/30 bg-success/5 shadow-lg">
          <CardContent className="py-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-success mb-2">Informe enviado</h3>
              <p className="text-muted-foreground max-w-md">
                Hemos enviado el informe completo a <strong className="text-foreground">{email}</strong>. 
                Revisa tu bandeja de entrada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative mt-8">
      {/* Blurred preview of flags */}
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />
        <div className="blur-sm pointer-events-none opacity-60">
          <div className="grid gap-4 md:grid-cols-2 p-4">
            {[...Array(Math.min(totalFlags, 4))].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-4 bg-muted rounded" />
                  <div className="w-20 h-4 bg-muted rounded" />
                </div>
                <div className="w-full h-4 bg-muted rounded mb-2" />
                <div className="w-3/4 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unlock card */}
      <Card className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 shadow-2xl border-2">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ver informe completo de seguridad</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Introduce tu email para recibir el análisis detallado con todos los flags detectados.
            </p>
            
            <form onSubmit={handleUnlock} className="w-full max-w-sm space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 h-11"
                  disabled={isSending}
                />
              </div>
              
              {sendError && (
                <p className="text-sm text-danger">{sendError}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-11"
                disabled={!isValidEmail || isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando informe...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Desbloquear informe
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-3">
              Recibirás el informe completo en tu email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResultsDisplay({ result, analyzedUrl }: { result: ScanResult; analyzedUrl: string }) {
  const totalFlags = result.flags_estaticos.length + result.flags_semanticos.length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VerdictCard result={result} />
      
      {totalFlags > 0 && (
        <LockedReportSection result={result} analyzedUrl={analyzedUrl} />
      )}
      
      {totalFlags === 0 && (
        <Card className="border-success/30 bg-success/5 mt-8">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-success mb-1">Sin amenazas detectadas</h3>
            <p className="text-sm text-muted-foreground">
              No hemos encontrado ningún patrón sospechoso en este skill.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <Card className="border-2 border-dashed animate-in fade-in duration-300">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>
          <p className="mt-6 text-lg font-semibold">Analizando skill...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Ejecutando análisis estático y semántico
          </p>
          <div className="flex gap-1.5 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HeroSection({
  onAnalyze,
  isLoading,
}: {
  onAnalyze: (url: string) => void
  isLoading: boolean
}) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
    }
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
          ¿Es seguro este skill de IA?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Analiza cualquier skill de GitHub antes de instalarlo. Detectamos código malicioso, 
          comportamientos sospechosos y vulnerabilidades de seguridad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-2">
          <CardContent className="p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://github.com/usuario/skill"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-12 text-base border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-6 text-base font-semibold shadow-md"
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Analizar ahora
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Code,
      title: "Análisis Estático",
      description: "Detectamos patrones peligrosos, Base64 oculto, URLs sospechosas y código potencialmente malicioso.",
    },
    {
      icon: Brain,
      title: "Análisis Semántico con IA",
      description: "Evaluamos la intención de cada instrucción con inteligencia artificial para detectar amenazas sofisticadas.",
    },
    {
      icon: FileText,
      title: "Informe de Seguridad",
      description: "Score de riesgo 0-100 con explicación detallada de cada amenaza detectada y recomendaciones.",
    },
  ]

  return (
    <section className="py-16 mt-12 border-t border-border">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold mb-3">Cómo funciona</h3>
        <p className="text-muted-foreground">Tres capas de análisis para máxima seguridad</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-8 pb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function WhatWeDetect() {
  const threats = [
    { icon: KeyRound, title: "Robo de credenciales y API keys", color: "text-danger" },
    { icon: MessageSquareWarning, title: "Exfiltración de datos de conversación", color: "text-danger" },
    { icon: Link2, title: "Redirección a endpoints maliciosos", color: "text-warning" },
    { icon: EyeOff, title: "Instrucciones ocultas de silenciamiento", color: "text-warning" },
    { icon: Binary, title: "Código ofuscado en Base64", color: "text-warning" },
    { icon: Users, title: "Ingeniería social disfrazada", color: "text-info" },
  ]

  return (
    <section className="py-16 border-t border-border">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold mb-3">Qué detectamos</h3>
        <p className="text-muted-foreground">Protección completa contra las amenazas más comunes en skills de IA</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {threats.map((threat, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
          >
            <div className={`flex-shrink-0 ${threat.color}`}>
              <threat.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{threat.title}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold">SkillGuard</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 — Seguridad para la era de los agentes IA
        </p>
      </div>
    </footer>
  )
}

export default function SkillGuardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzedUrl, setAnalyzedUrl] = useState("")

  const handleAnalyze = async (url: string) => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setAnalyzedUrl(url)

    try {
      const response = await fetch("https://web-production-cf779.up.railway.app/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar el skill")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 max-w-5xl">
        <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />

        {isLoading && <LoadingState />}

        {error && (
          <Card className="border-danger/30 bg-danger/5 mb-8 animate-in fade-in duration-300">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-danger flex-shrink-0" />
                <p className="text-danger font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !isLoading && <ResultsDisplay result={result} analyzedUrl={analyzedUrl} />}

        <HowItWorks />
        <WhatWeDetect />
      </main>

      <Footer />
    </div>
  )
}
