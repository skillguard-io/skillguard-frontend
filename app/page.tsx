"use client"

import { useState, useEffect, useRef  } from "react"
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
  Users,
  Download,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

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

function Header({ user, onLogin, onLogout }: {
  user: User | null
  onLogin: () => void
  onLogout: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

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

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary transition-all"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {(user.user_metadata?.user_name || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium">{user.user_metadata?.user_name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="py-1">

                    <a href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Mi Dashboard
                    </a>
                    <button
                      onClick={() => { onLogout(); setMenuOpen(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Github className="h-4 w-4" />
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header >
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

function ProjectSelector({ user, scanId, onProjectAssigned }: {
  user: User
  scanId: string | null
  onProjectAssigned: (projectId: string, projectName: string) => void
}) {
  const [proyectos, setProyectos] = useState<{ id: string; nombre: string }[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [creatingNew, setCreatingNew] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [assigned, setAssigned] = useState(false)

  useEffect(() => {
    cargarProyectos()
  }, [])

  const cargarProyectos = async () => {
    const { data } = await supabase
      .from('proyectos')
      .select('id, nombre')
      .order('created_at', { ascending: false })
    setProyectos(data || [])
    if (!data || data.length === 0) setCreatingNew(true)
  }

  const handleAssign = async () => {
    if (!scanId) return
    setIsLoading(true)

    try {
      let projectId = selectedProject

      // Crear nuevo proyecto si es necesario
      if (creatingNew && newProjectName.trim()) {
        const { data, error } = await supabase
          .from('proyectos')
          .insert({ nombre: newProjectName.trim(), user_id: user.id })
          .select()
          .single()

        if (error) throw error
        projectId = data.id
      }

      if (!projectId) return

      // Asignar scan al proyecto
      await supabase
        .from('scans')
        .update({ proyecto_id: projectId })
        .eq('id', scanId)

      const projectName = creatingNew
        ? newProjectName.trim()
        : proyectos.find(p => p.id === projectId)?.nombre || ''

      setAssigned(true)
      onProjectAssigned(projectId, projectName)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (assigned) {
    return (
      <div className="flex items-center gap-2 text-sm text-success mt-2">
        <CheckCircle className="h-4 w-4" />
        Scan asignado al proyecto correctamente
      </div>
    )
  }

  return (
    <Card className="mt-6 border-dashed">
      <CardContent className="py-4">
        <p className="text-sm font-medium mb-3">Asignar a un proyecto</p>

        {!creatingNew && proyectos.length > 0 ? (
          <div className="flex gap-2">
            <select
              value={selectedProject}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setCreatingNew(true)
                  setSelectedProject('')
                } else {
                  setSelectedProject(e.target.value)
                }
              }}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="">Selecciona un proyecto...</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
              <option value="__new__">+ Crear nuevo proyecto</option>
            </select>
            <Button
              onClick={handleAssign}
              disabled={!selectedProject || isLoading}
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Asignar'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {proyectos.length > 0 && (
              <button
                onClick={() => setCreatingNew(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Volver
              </button>
            )}
            <input
              type="text"
              placeholder="Nombre del proyecto..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
            <Button
              onClick={handleAssign}
              disabled={!newProjectName.trim() || isLoading}
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear y asignar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UnlockedReportSection({ result, analyzedUrl }: {
  result: ScanResult
  analyzedUrl: string
}) {
  const handleDownload = () => {
    const { jsPDF } = require('jspdf')
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let y = 20

    const addText = (text: string, size = 10, bold = false, color = [0, 0, 0]) => {
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setTextColor(color[0], color[1], color[2])
      const lines = doc.splitTextToSize(text, maxWidth)
      if (y + lines.length * (size * 0.4) > 280) {
        doc.addPage()
        y = 20
      }
      doc.text(lines, margin, y)
      y += lines.length * (size * 0.4) + 3
    }

    const addLine = () => {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6
    }

    // Header
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('SkillGuard — Informe de Seguridad', margin, 19)
    y = 40

    // Score y veredicto
    const scoreColor = result.score > 60 ? [220, 38, 38] : result.score > 30 ? [217, 119, 6] : [22, 163, 74]
    addText(`Veredicto: ${result.veredicto}`, 14, true, scoreColor)
    addText(`Score de riesgo: ${result.score}/100`, 12, false, scoreColor)
    addText(`Score estático: ${result.score_estatico}/100  |  Score semántico: ${result.score_semantico}/100`, 10)
    addText(`URL analizada: ${analyzedUrl}`, 9, false, [100, 100, 100])
    addText(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 9, false, [100, 100, 100])
    y += 4
    addLine()

    // Resumen
    addText('Resumen del análisis', 12, true)
    addText(result.resumen, 10)
    y += 4
    addLine()

    // Flags estáticos
    if (result.flags_estaticos.length > 0) {
      addText(`Flags Estáticos (${result.flags_estaticos.length})`, 12, true)
      y += 2
      result.flags_estaticos.forEach((flag, i) => {
        const color = flag.severidad === 'HIGH' ? [220, 38, 38] : flag.severidad === 'MEDIUM' ? [217, 119, 6] : [37, 99, 235]
        addText(`${i + 1}. [${flag.severidad}] ${flag.categoria} — línea ${flag.linea}`, 10, true, color)
        addText(flag.descripcion, 9)
        if (flag.texto) addText(`Texto: ${flag.texto}`, 9, false, [100, 100, 100])
        if (flag.url) addText(`URL: ${flag.url}`, 9, false, [100, 100, 100])
        if (flag.decoded) addText(`Decoded: ${flag.decoded}`, 9, false, [100, 100, 100])
        y += 2
      })
      addLine()
    }

    // Flags semánticos
    if (result.flags_semanticos.length > 0) {
      addText(`Flags Semánticos (${result.flags_semanticos.length})`, 12, true)
      y += 2
      result.flags_semanticos.forEach((flag, i) => {
        const color = flag.severidad === 'HIGH' ? [220, 38, 38] : flag.severidad === 'MEDIUM' ? [217, 119, 6] : [37, 99, 235]
        addText(`${i + 1}. [${flag.severidad}] ${flag.categoria} — línea ${flag.linea}`, 10, true, color)
        if (flag.explicacion) addText(flag.explicacion, 9)
        if (flag.texto) addText(`Texto: ${flag.texto}`, 9, false, [100, 100, 100])
        y += 2
      })
      addLine()
    }

    // Footer
    addText('SkillGuard © 2026 — Seguridad para la era de los agentes IA', 9, false, [150, 150, 150])

    doc.save(`skillguard-informe-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getSeverityColor = (severidad: string) => {
    if (severidad === 'HIGH') return 'text-red-600 bg-red-50 border-red-200'
    if (severidad === 'MEDIUM') return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Informe completo de seguridad</h3>
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Descargar informe
        </Button>
      </div>

      {/* Flags estáticos */}
      {result.flags_estaticos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Flags estáticos ({result.flags_estaticos.length})
          </h4>
          <div className="space-y-3">
            {result.flags_estaticos.map((flag, i) => (
              <div key={i} className={`border rounded-lg p-4 ${getSeverityColor(flag.severidad)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded border">
                    {flag.severidad}
                  </span>
                  <span className="text-sm font-medium">{flag.categoria}</span>
                  <span className="text-xs opacity-60 ml-auto">línea {flag.linea}</span>
                </div>
                <p className="text-sm opacity-80">{flag.descripcion}</p>
                {flag.texto && <code className="text-xs mt-1 block opacity-70">{flag.texto}</code>}
                {flag.url && <code className="text-xs mt-1 block opacity-70">{flag.url}</code>}
                {flag.decoded && <code className="text-xs mt-1 block opacity-70">Decoded: {flag.decoded}</code>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flags semánticos */}
      {result.flags_semanticos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Flags semánticos ({result.flags_semanticos.length})
          </h4>
          <div className="space-y-3">
            {result.flags_semanticos.map((flag, i) => (
              <div key={i} className={`border rounded-lg p-4 ${getSeverityColor(flag.severidad)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded border">
                    {flag.severidad}
                  </span>
                  <span className="text-sm font-medium">{flag.categoria}</span>
                  <span className="text-xs opacity-60 ml-auto">línea {flag.linea}</span>
                </div>
                <p className="text-sm opacity-80">{flag.explicacion}</p>
                {flag.texto && <code className="text-xs mt-1 block opacity-70">{flag.texto}</code>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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

function ResultsDisplay({ result, analyzedUrl, user, scanId }: {
  result: ScanResult
  analyzedUrl: string
  user: User | null
  scanId: string | null
}) {
  const totalFlags = result.flags_estaticos.length + result.flags_semanticos.length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VerdictCard result={result} />

      {user ? (
        <>
          {totalFlags > 0 && <UnlockedReportSection result={result} analyzedUrl={analyzedUrl} />}

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

          <ProjectSelector
            user={user}
            scanId={scanId}
            onProjectAssigned={(projectId, projectName) => {
              console.log('Asignado a:', projectName)
            }}
          />
        </>
      ) : (
        <>
          {totalFlags > 0 && <LockedReportSection result={result} analyzedUrl={analyzedUrl} />}

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
        </>
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
  onAnalyzeContent,
  isLoading,
}: {
  onAnalyze: (url: string) => void
  onAnalyzeContent: (contenido: string, nombre: string) => void
  isLoading: boolean
}) {
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'text'>('url')
  const [url, setUrl] = useState("")
  const [texto, setTexto] = useState("")
  const [fileName, setFileName] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) onAnalyze(url.trim())
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (texto.trim()) onAnalyzeContent(texto.trim(), "skill_pegado.md")
  }

  const processFile = (file: File) => {
    if (file.size > 500000) {
      alert("El archivo supera el límite de 500KB")
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const contenido = e.target?.result as string
      onAnalyzeContent(contenido, file.name)
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const tabs = [
    { id: 'url' as const, label: 'URL de GitHub', icon: <Github className="h-4 w-4" /> },
    { id: 'file' as const, label: 'Subir archivo', icon: <Upload className="h-4 w-4" /> },
    { id: 'text' as const, label: 'Pegar texto', icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <section className="py-12 lg:py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
          ¿Es seguro este skill de IA?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Analiza cualquier skill antes de instalarlo. Detectamos código malicioso,
          comportamientos sospechosos y vulnerabilidades de seguridad.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-3 bg-muted p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <Card className="shadow-lg border-2">
          <CardContent className="p-3">

            {/* Tab URL */}
            {activeTab === 'url' && (
              <form onSubmit={handleUrlSubmit}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://github.com/usuario/repo/blob/main/SKILL.md"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-12 h-12 text-base border-0 bg-muted/50"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-6 font-semibold" disabled={isLoading || !url.trim()}>
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analizando...</> : <><Search className="mr-2 h-5 w-5" />Analizar</>}
                  </Button>
                </div>
              </form>
            )}

            {/* Tab Archivo */}
            {activeTab === 'file' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                {isLoading && fileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analizando {fileName}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {fileName ? `✅ ${fileName}` : 'Arrastra tu SKILL.md aquí'}
                    </p>
                    <p className="text-xs text-muted-foreground">o haz clic para seleccionar — máx 500KB</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Texto */}
            {activeTab === 'text' && (
              <form onSubmit={handleTextSubmit} className="space-y-2">
                <textarea
                  placeholder="Pega aquí el contenido de tu SKILL.md..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  disabled={isLoading}
                  rows={6}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading || !texto.trim()}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analizando...</> : <><Search className="mr-2 h-4 w-4" />Analizar texto</>}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
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
  const [user, setUser] = useState<User | null>(null)  // ← AÑADIR
  const [scanId, setScanId] = useState<string | null>(null)

  // ← AÑADIR ESTO
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

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

      // Guardar scan en Supabase si hay sesión
      if (user) {
        const scanData = await supabase.from('scans').insert({
          user_id: user.id,
          url: url,
          score: data.score,
          score_estatico: data.score_estatico,
          score_semantico: data.score_semantico,
          veredicto: data.veredicto,
          resumen: data.resumen,
          flags_estaticos: data.flags_estaticos,
          flags_semanticos: data.flags_semanticos
        }).select().single()

        if (scanData.data) setScanId(scanData.data.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar el skill")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeContent = async (contenido: string, nombre: string) => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    setAnalyzedUrl(nombre)
    setScanId(null)

    try {
      const response = await fetch("https://web-production-cf779.up.railway.app/scan/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido, nombre })
      })

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)

      const data = await response.json()
      setResult(data)

      if (user) {
        const scanData = await supabase.from('scans').insert({
          user_id: user.id,
          url: nombre,
          score: data.score,
          score_estatico: data.score_estatico,
          score_semantico: data.score_semantico,
          veredicto: data.veredicto,
          resumen: data.resumen,
          flags_estaticos: data.flags_estaticos,
          flags_semanticos: data.flags_semanticos
        }).select().single()

        if (scanData.data) setScanId(scanData.data.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar el skill")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 max-w-5xl">
        <HeroSection onAnalyze={handleAnalyze} onAnalyzeContent={handleAnalyzeContent} isLoading={isLoading} />

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

        {result && !isLoading && <ResultsDisplay result={result} analyzedUrl={analyzedUrl} user={user} scanId={scanId} />}
        <HowItWorks />
        <WhatWeDetect />
      </main>

      <Footer />
    </div>
  )
}
