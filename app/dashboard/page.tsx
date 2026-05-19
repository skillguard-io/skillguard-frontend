"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Shield, ChevronDown, ChevronRight, Download, Trash2, Plus, AlertTriangle, CheckCircle, AlertCircle, Skull } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Scan {
    id: string
    url: string
    score: number
    score_estatico: number
    score_semantico: number
    veredicto: string
    resumen: string
    total_flags: number
    flags_estaticos: any[]
    flags_semanticos: any[]
    created_at: string
    proyecto_id: string | null
}

interface Proyecto {
    id: string
    nombre: string
    created_at: string
    scans: Scan[]
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [proyectos, setProyectos] = useState<Proyecto[]>([])
    const [scansSinProyecto, setScansSinProyecto] = useState<Scan[]>([])
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/')
                return
            }
            setUser(session.user)
            cargarDatos(session.user.id)
        })
    }, [])

    const cargarDatos = async (userId: string) => {
        setIsLoading(true)

        // Cargar proyectos
        const { data: proyectosData } = await supabase
            .from('proyectos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        // Cargar todos los scans
        const { data: scansData } = await supabase
            .from('scans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (proyectosData && scansData) {
            // Agrupar scans por proyecto
            const proyectosConScans = proyectosData.map(p => ({
                ...p,
                scans: scansData.filter(s => s.proyecto_id === p.id)
            }))

            setProyectos(proyectosConScans)
            setScansSinProyecto(scansData.filter(s => !s.proyecto_id))
        }

        setIsLoading(false)
    }

    const toggleProject = (id: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const getVerdictIcon = (veredicto: string) => {
        if (veredicto === 'LIMPIO') return <CheckCircle className="h-4 w-4 text-green-500" />
        if (veredicto === 'BAJO RIESGO') return <AlertCircle className="h-4 w-4 text-yellow-500" />
        if (veredicto === 'SOSPECHOSO') return <AlertTriangle className="h-4 w-4 text-orange-500" />
        return <Skull className="h-4 w-4 text-red-500" />
    }

    const getScoreColor = (score: number) => {
        if (score === 0) return 'text-green-600'
        if (score < 30) return 'text-yellow-600'
        if (score < 60) return 'text-orange-600'
        return 'text-red-600'
    }

    const getProjectScore = (scans: Scan[]) => {
        if (scans.length === 0) return 0
        return Math.max(...scans.map(s => s.score))
    }

    const handleDownloadScan = (scan: Scan) => {
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
            if (y + lines.length * (size * 0.4) > 280) { doc.addPage(); y = 20 }
            doc.text(lines, margin, y)
            y += lines.length * (size * 0.4) + 3
        }

        const addLine = () => {
            doc.setDrawColor(200, 200, 200)
            doc.line(margin, y, pageWidth - margin, y)
            y += 6
        }

        doc.setFillColor(22, 163, 74)
        doc.rect(0, 0, pageWidth, 30, 'F')
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('SkillGuard — Informe de Seguridad', margin, 19)
        y = 40

        const scoreColor = scan.score > 60 ? [220, 38, 38] : scan.score > 30 ? [217, 119, 6] : [22, 163, 74]
        addText(`Veredicto: ${scan.veredicto}`, 14, true, scoreColor)
        addText(`Score: ${scan.score}/100`, 12, false, scoreColor)
        addText(`URL: ${scan.url}`, 9, false, [100, 100, 100])
        addText(`Fecha: ${new Date(scan.created_at).toLocaleDateString('es-ES')}`, 9, false, [100, 100, 100])
        y += 4
        addLine()

        addText('Resumen', 12, true)
        addText(scan.resumen || 'Sin resumen disponible', 10)
        y += 4
        addLine()

        if (scan.flags_estaticos?.length > 0) {
            addText(`Flags Estáticos (${scan.flags_estaticos.length})`, 12, true)
            scan.flags_estaticos.forEach((f, i) => {
                const c = f.severidad === 'HIGH' ? [220, 38, 38] : f.severidad === 'MEDIUM' ? [217, 119, 6] : [37, 99, 235]
                addText(`${i + 1}. [${f.severidad}] ${f.categoria} — línea ${f.linea}`, 10, true, c)
                addText(f.descripcion, 9)
                if (f.texto) addText(`Texto: ${f.texto}`, 9, false, [100, 100, 100])
            })
            addLine()
        }

        if (scan.flags_semanticos?.length > 0) {
            addText(`Flags Semánticos (${scan.flags_semanticos.length})`, 12, true)
            scan.flags_semanticos.forEach((f, i) => {
                const c = f.severidad === 'HIGH' ? [220, 38, 38] : f.severidad === 'MEDIUM' ? [217, 119, 6] : [37, 99, 235]
                addText(`${i + 1}. [${f.severidad}] ${f.categoria} — línea ${f.linea}`, 10, true, c)
                if (f.explicacion) addText(f.explicacion, 9)
            })
        }

        addText('SkillGuard © 2026', 9, false, [150, 150, 150])
        doc.save(`skillguard-${new Date(scan.created_at).toISOString().split('T')[0]}.pdf`)
    }

    const ScanRow = ({ scan }: { scan: Scan }) => (
        <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            {getVerdictIcon(scan.veredicto)}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{scan.url}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(scan.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
            </div>
            <span className={`text-sm font-bold ${getScoreColor(scan.score)}`}>
                {scan.score}/100
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline px-2 py-1 bg-muted rounded">
                {scan.veredicto}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleDownloadScan(scan)}>
                <Download className="h-4 w-4" />
            </Button>
        </div>
    )

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-10 w-10 text-primary mx-auto mb-3 animate-pulse" />
                    <p className="text-muted-foreground">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">SkillGuard</h1>
                        </a>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            ← Volver al scanner
                        </a>
                        {user?.user_metadata?.avatar_url && (
                            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Mi Dashboard</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} · {proyectos.reduce((acc, p) => acc + p.scans.length, 0) + scansSinProyecto.length} scans totales
                        </p>
                    </div>
                    <Button onClick={() => router.push('/')} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo scan
                    </Button>
                </div>

                {/* Proyectos */}
                {proyectos.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {proyectos.map(proyecto => {
                            const isExpanded = expandedProjects.has(proyecto.id)
                            const projectScore = getProjectScore(proyecto.scans)

                            return (
                                <Card key={proyecto.id} className="overflow-hidden">
                                    <button
                                        onClick={() => toggleProject(proyecto.id)}
                                        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/30 transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{proyecto.nombre}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {proyecto.scans.length} skill{proyecto.scans.length !== 1 ? 's' : ''} analizadas
                                            </p>
                                        </div>
                                        <span className={`text-sm font-bold ${getScoreColor(projectScore)}`}>
                                            {projectScore > 0 ? `Riesgo máx: ${projectScore}/100` : 'Sin riesgos'}
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-border">
                                            {proyecto.scans.length > 0 ? (
                                                proyecto.scans.map(scan => <ScanRow key={scan.id} scan={scan} />)
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-6">
                                                    No hay skills analizadas en este proyecto
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Scans sin proyecto */}
                {scansSinProyecto.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-muted-foreground">Sin proyecto asignado</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {scansSinProyecto.map(scan => <ScanRow key={scan.id} scan={scan} />)}
                        </CardContent>
                    </Card>
                )}

                {proyectos.length === 0 && scansSinProyecto.length === 0 && (
                    <div className="text-center py-20">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay scans todavía</h3>
                        <p className="text-muted-foreground text-sm mb-6">Analiza tu primer skill para verlo aquí</p>
                        <Button onClick={() => router.push('/')}>Ir al scanner</Button>
                    </div>
                )}
            </main>
        </div>
    )
}