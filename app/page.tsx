"use client"

import { useState } from "react"
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Github, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  verdict: string
  semantic_summary: string
  flags_estaticos: Flag[]
  flags_semanticos: Flag[]
}

function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SkillGuard</h1>
            <p className="text-xs text-muted-foreground">Analiza la seguridad de tus skills de IA antes de usarlos</p>
          </div>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </header>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score <= 30) return { stroke: "var(--success)", text: "text-success", bg: "bg-success/10" }
    if (score <= 60) return { stroke: "var(--warning)", text: "text-warning", bg: "bg-warning/10" }
    return { stroke: "var(--danger)", text: "text-danger", bg: "bg-danger/10" }
  }

  const { stroke, text, bg } = getScoreColor(score)
  const circumference = 2 * Math.PI * 80
  const progress = ((100 - score) / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full ${bg} p-6`}>
      <svg className="transform -rotate-90 w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke={stroke}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${text}`}>{score}</span>
        <span className="text-sm text-muted-foreground mt-1">Riesgo</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: "HIGH" | "MEDIUM" | "LOW" }) {
  const styles = {
    HIGH: "bg-danger/20 text-danger border-danger/30",
    MEDIUM: "bg-warning/20 text-warning border-warning/30",
    LOW: "bg-success/20 text-success border-success/30",
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded border ${styles[severity]}`}>
      {severity}
    </span>
  )
}

function FlagItem({ flag, isSemantic = false }: { flag: Flag; isSemantic?: boolean }) {
  return (
    <div className="border border-border/50 rounded-lg p-4 bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={flag.severidad} />
          <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
            {flag.categoria}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Línea {flag.linea}
        </span>
      </div>
      <p className="text-sm text-foreground/90 mb-2">{flag.descripcion}</p>

      {flag.texto && (
        <div className="mt-2 p-2 bg-muted/30 rounded font-mono text-xs text-muted-foreground overflow-x-auto">
          <code>{flag.texto}</code>
        </div>
      )}

      {flag.decoded && (
        <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded">
          <span className="text-xs text-warning font-medium">Decodificado: </span>
          <code className="text-xs text-foreground/80">{flag.decoded}</code>
        </div>
      )}

      {flag.url && (
        <div className="mt-2 p-2 bg-danger/10 border border-danger/20 rounded">
          <span className="text-xs text-danger font-medium">URL: </span>
          <code className="text-xs text-foreground/80 break-all">{flag.url}</code>
        </div>
      )}

      {isSemantic && flag.explicacion && (
        <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded">
          <span className="text-xs text-primary font-medium">Explicación: </span>
          <span className="text-xs text-foreground/80">{flag.explicacion}</span>
        </div>
      )}
    </div>
  )
}

function FlagSection({ title, flags, icon: Icon, isSemantic = false }: { title: string; flags: Flag[]; icon: React.ElementType; isSemantic?: boolean }) {
  if (flags.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {flags.length}
        </span>
      </div>
      <div className="space-y-3">
        {flags.map((flag, index) => (
          <FlagItem key={index} flag={flag} isSemantic={isSemantic} />
        ))}
      </div>
    </div>
  )
}

function ResultsDisplay({ result }: { result: ScanResult }) {
  const getVerdictIcon = (score: number) => {
    if (score <= 30) return <CheckCircle className="h-8 w-8 text-success" />
    if (score <= 60) return <AlertTriangle className="h-8 w-8 text-warning" />
    return <XCircle className="h-8 w-8 text-danger" />
  }

  const getVerdictColor = (score: number) => {
    if (score <= 30) return "text-success"
    if (score <= 60) return "text-warning"
    return "text-danger"
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score and Verdict - Centered */}
      <div className="flex flex-col items-center text-center">
        <ScoreCircle score={result.score} />

        {/* Score badges */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 border border-border/50 rounded-lg">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Estático:</span>
            <span className="text-sm font-semibold">{result.score_estatico}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 border border-border/50 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Semántico:</span>
            <span className="text-sm font-semibold">{result.score_semantico}</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {getVerdictIcon(result.score)}
          <h2 className={`text-3xl font-bold ${getVerdictColor(result.score)}`}>
            {result.verdict}
          </h2>
        </div>

        {/* Summary */}
        <p className="text-muted-foreground leading-relaxed max-w-2xl mt-4">
          {result.semantic_summary}
        </p>
      </div>

      {/* Flags */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              Flags Estáticos
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">
                {result.flags_estaticos.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.flags_estaticos.length > 0 ? (
              <div className="space-y-3">
                {result.flags_estaticos.map((flag, index) => (
                  <FlagItem key={index} flag={flag} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No se detectaron flags estáticos
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Flags Semánticos
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground ml-auto">
                {result.flags_semanticos.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.flags_semanticos.length > 0 ? (
              <div className="space-y-3">
                {result.flags_semanticos.map((flag, index) => (
                  <FlagItem key={index} flag={flag} isSemantic />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No se detectaron flags semánticos
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
      </div>
      <p className="mt-6 text-lg font-medium">Analizando skill...</p>
      <p className="text-sm text-muted-foreground mt-2">
        Esto puede tomar unos segundos
      </p>
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
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
    <section className="py-16 lg:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Seguridad para IA</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
          Analiza skills de IA
          <br />
          <span className="text-primary">antes de confiar en ellos</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Pega la URL de un repositorio de GitHub y descubre vulnerabilidades,
          patrones sospechosos y riesgos de seguridad en segundos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card/50 border border-border/50 rounded-xl backdrop-blur">
          <div className="relative flex-1">
            <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://github.com/usuario/repositorio"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-12 h-14 text-base bg-input border-0 focus-visible:ring-1 focus-visible:ring-primary"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 text-base font-semibold"
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
                Analizar
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Soportamos repositorios públicos de GitHub con skills de IA
        </p>
      </form>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Search,
      title: "Análisis Estático",
      description: "Detectamos patrones peligrosos, llamadas a APIs sospechosas y código potencialmente malicioso.",
    },
    {
      icon: AlertTriangle,
      title: "Análisis Semántico",
      description: "Evaluamos la intención del código usando IA para identificar comportamientos ocultos.",
    },
    {
      icon: Shield,
      title: "Score de Riesgo",
      description: "Puntuación clara de 0-100 que indica el nivel de peligro del skill analizado.",
    },
  ]

  return (
    <section className="py-16 border-t border-border/30">
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-xl bg-card/30 border border-border/30 hover:border-border/50 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function SkillGuardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (url: string) => {
    setIsLoading(true)
    setResult(null)
    setError(null)

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

      <main className="flex-1 container mx-auto px-4">
        <HeroSection onAnalyze={handleAnalyze} isLoading={isLoading} />

        {isLoading && <LoadingState />}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-danger/10 border border-danger/30 rounded-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-danger flex-shrink-0" />
              <p className="text-danger">{error}</p>
            </div>
          </div>
        )}

        {result && !isLoading && <ResultsDisplay result={result} />}

        {!result && !isLoading && !error && <Features />}
      </main>

      <footer className="border-t border-border/30 py-6 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SkillGuard — Protege tus sistemas de IA con análisis de seguridad avanzado</p>
        </div>
      </footer>
    </div>
  )
}
