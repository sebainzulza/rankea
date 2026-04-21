import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2, GraduationCap, Star, MessageSquare, CheckCircle2, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { NuevaResenaForm } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import RatingStars from '@/components/RatingStars'

const RATING_LABELS: Record<string, { label: string; desc: string }> = {
  calificacion_general: { label: 'Nota general', desc: '¿Cómo calificarías al profe en general?' },
  calificacion_explicacion: { label: 'Claridad al explicar', desc: '¿Explica bien los contenidos?' },
  calificacion_exigencia: { label: 'Nivel de exigencia', desc: '¿Qué tan exigente es? (5 = muy exigente)' },
  calificacion_accesibilidad: { label: 'Accesibilidad', desc: '¿Responde dudas fuera de clases?' },
}

const FORM_INICIAL: NuevaResenaForm = {
  profesor_nombre: '',
  profesor_apellido: '',
  ramo_nombre: '',
  carrera_nombre: '',
  calificacion_general: 0,
  calificacion_explicacion: 0,
  calificacion_exigencia: 0,
  calificacion_accesibilidad: 0,
  comentario: '',
  semestre: '',
}

async function findOrCreateCarrera(nombre: string, userId: string): Promise<string | null> {
  const clean = nombre.trim()
  if (!clean) return null
  const { data: existing, error: findErr } = await supabase
    .from('carreras')
    .select('id')
    .ilike('nombre', clean)
    .maybeSingle()
  if (findErr) throw findErr
  if (existing) return existing.id
  const { data: nueva, error } = await supabase
    .from('carreras')
    .insert({ nombre: clean, created_by: userId })
    .select('id')
    .single()
  if (error) throw error
  return nueva.id
}

async function findOrCreateProfesor(nombre: string, apellido: string, userId: string): Promise<string> {
  const n = nombre.trim()
  const a = apellido.trim()
  const { data: existing, error: findErr } = await supabase
    .from('profesores')
    .select('id')
    .ilike('nombre', n)
    .ilike('apellido', a)
    .maybeSingle()
  if (findErr) throw findErr
  if (existing) return existing.id
  const { data: nuevo, error } = await supabase
    .from('profesores')
    .insert({ nombre: n, apellido: a, created_by: userId })
    .select('id')
    .single()
  if (error) throw error
  return nuevo.id
}

async function findOrCreateRamo(nombre: string, carreraId: string | null, userId: string): Promise<string> {
  const clean = nombre.trim()
  const { data: existing, error: findErr } = await supabase
    .from('ramos')
    .select('id')
    .ilike('nombre', clean)
    .maybeSingle()
  if (findErr) throw findErr
  if (existing) return existing.id
  const { data: nuevo, error } = await supabase
    .from('ramos')
    .insert({ nombre: clean, carrera_id: carreraId, created_by: userId })
    .select('id')
    .single()
  if (error) throw error
  return nuevo.id
}

type TextField = 'profesor_nombre' | 'profesor_apellido' | 'ramo_nombre' | 'semestre' | 'comentario'

export default function NuevaResenaPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [form, setForm] = useState<NuevaResenaForm>(FORM_INICIAL)
  const [submitting, setSubmitting] = useState(false)
  const [prefilling, setPrefilling] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<TextField, boolean>>>({})
  const markTouched = (f: TextField) => setTouched(t => ({ ...t, [f]: true }))

  useEffect(() => {
    const profesorId = searchParams.get('profesor_id')
    if (!profesorId) {
      // Navegar sin param = formulario limpio (ej: desde "¿Es otro profe?")
      setForm(f => ({ ...f, profesor_nombre: '', profesor_apellido: '' }))
      setTouched(t => ({ ...t, profesor_nombre: false, profesor_apellido: false }))
      return
    }
    const prefill = async () => {
      setPrefilling(true)
      const { data, error } = await supabase
        .from('profesores')
        .select('nombre, apellido')
        .eq('id', profesorId)
        .maybeSingle()
      if (!error && data) {
        setForm(f => ({ ...f, profesor_nombre: data.nombre, profesor_apellido: data.apellido }))
      }
      setPrefilling(false)
    }
    void prefill()
  }, [searchParams])

  const setRating = (key: keyof NuevaResenaForm, val: number) => {
    setForm(f => ({ ...f, [key]: val }))
  }

  const errors = {
    profesor_nombre:
      form.profesor_nombre.trim().length === 0
        ? 'Ingresa el nombre del profe'
        : form.profesor_nombre.trim().length < 2
        ? 'Mínimo 2 caracteres'
        : null,
    profesor_apellido:
      form.profesor_apellido.trim().length === 0
        ? 'Ingresa el apellido del profe'
        : form.profesor_apellido.trim().length < 2
        ? 'Mínimo 2 caracteres'
        : null,
    ramo_nombre:
      form.ramo_nombre.trim().length === 0
        ? 'Ingresa el nombre del ramo'
        : form.ramo_nombre.trim().length < 2
        ? 'Mínimo 2 caracteres'
        : null,
    semestre:
      form.semestre.trim().length === 0
        ? 'Indica el semestre en que lo cursaste'
        : form.semestre.trim().length < 4
        ? 'Mínimo 4 caracteres (ej: "2024-2" o "primer semestre de 2026")'
        : null,
    comentario:
      form.comentario.trim().length === 0
        ? 'Escribe un comentario honesto (mín. 20 caracteres)'
        : form.comentario.trim().length < 20
        ? `Faltan ${20 - form.comentario.trim().length} caracteres para el mínimo`
        : null,
  }

  const ratingsMissing =
    form.calificacion_general === 0 ||
    form.calificacion_explicacion === 0 ||
    form.calificacion_exigencia === 0 ||
    form.calificacion_accesibilidad === 0

  const isValido =
    !errors.profesor_nombre &&
    !errors.profesor_apellido &&
    !errors.ramo_nombre &&
    !errors.semestre &&
    !errors.comentario &&
    !ratingsMissing

  const missingSummary: string[] = []
  if (errors.profesor_nombre) missingSummary.push(`Nombre del profe: ${errors.profesor_nombre.toLowerCase()}`)
  if (errors.profesor_apellido) missingSummary.push(`Apellido del profe: ${errors.profesor_apellido.toLowerCase()}`)
  if (errors.ramo_nombre) missingSummary.push(`Ramo: ${errors.ramo_nombre.toLowerCase()}`)
  if (errors.semestre) missingSummary.push(`Semestre: ${errors.semestre.toLowerCase()}`)
  if (ratingsMissing) missingSummary.push('Calificaciones: puntúa las 4 categorías')
  if (errors.comentario) missingSummary.push(`Comentario: ${errors.comentario.toLowerCase()}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValido) return
    if (!user) {
      toast.error('Debes iniciar sesión para publicar una reseña.')
      return
    }
    setSubmitting(true)

    try {
      const carreraId = await findOrCreateCarrera(form.carrera_nombre, user.id)
      const profesorId = await findOrCreateProfesor(form.profesor_nombre, form.profesor_apellido, user.id)
      const ramoId = await findOrCreateRamo(form.ramo_nombre, carreraId, user.id)

      const { error } = await supabase.from('resenas').insert({
        profesor_id: profesorId,
        ramo_id: ramoId,
        autor_id: user.id,
        calificacion_general: form.calificacion_general,
        calificacion_explicacion: form.calificacion_explicacion,
        calificacion_exigencia: form.calificacion_exigencia,
        calificacion_accesibilidad: form.calificacion_accesibilidad,
        comentario: form.comentario.trim(),
        semestre: form.semestre.trim(),
      })
      if (error) throw error
      toast.success('¡Reseña publicada! Ahora puedes ver las reseñas de otros.')
      navigate(`/profesor/${profesorId}`)
    } catch (err) {
      console.error(err)
      toast.error('Error al publicar la reseña. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const section1Complete = !errors.profesor_nombre && !errors.profesor_apellido && !errors.ramo_nombre && !errors.semestre
  const section2Complete = !ratingsMissing
  const section3Complete = !errors.comentario

  const profesorIdParam = searchParams.get('profesor_id')
  const handleBack = () => {
    if (profesorIdParam) navigate(`/profesor/${profesorIdParam}`)
    else navigate('/')
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      {/* Hero header con gradiente tenue */}
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-xl shadow-sm shrink-0">
            <Send className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Nueva Reseña</h1>
            <p className="text-muted-foreground text-sm mt-1">
              3 secciones · toma ~2 minutos · 100% anónima
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Tu identidad no queda asociada a la reseña. Solo tú sabes que la escribiste.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-normal">Paso 1</span>
                    <span className="text-muted-foreground font-normal">·</span>
                    ¿A quién evalúas?
                  </CardTitle>
                  <CardDescription>
                    {profesorIdParam
                      ? 'Profe seleccionado desde su perfil. Solo faltan ramo y semestre.'
                      : 'Si el profe o ramo aún no está, se creará automáticamente.'}
                  </CardDescription>
                </div>
              </div>
              {section1Complete && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profesorIdParam ? (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-md shrink-0">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Rankeando a:</p>
                  <p className="font-semibold text-sm truncate">
                    {prefilling
                      ? 'Cargando...'
                      : `${form.profesor_nombre} ${form.profesor_apellido}`.trim()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/nueva-resena')}
                  className="text-xs text-primary hover:underline shrink-0 font-medium"
                >
                  ¿Es otro profe?
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profesor_nombre">Nombre del profesor</Label>
                  <Input
                    id="profesor_nombre"
                    placeholder="Ej: Juan"
                    value={form.profesor_nombre}
                    onChange={(e) => setForm(f => ({ ...f, profesor_nombre: e.target.value }))}
                    onBlur={() => markTouched('profesor_nombre')}
                    disabled={prefilling}
                    autoComplete="off"
                    className={touched.profesor_nombre && errors.profesor_nombre ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {touched.profesor_nombre && errors.profesor_nombre ? (
                    <p className="text-xs text-destructive">{errors.profesor_nombre}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Solo el nombre. Mínimo 2 caracteres.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profesor_apellido">Apellido</Label>
                  <Input
                    id="profesor_apellido"
                    placeholder="Ej: Pérez"
                    value={form.profesor_apellido}
                    onChange={(e) => setForm(f => ({ ...f, profesor_apellido: e.target.value }))}
                    onBlur={() => markTouched('profesor_apellido')}
                    disabled={prefilling}
                    autoComplete="off"
                    className={touched.profesor_apellido && errors.profesor_apellido ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {touched.profesor_apellido && errors.profesor_apellido ? (
                    <p className="text-xs text-destructive">{errors.profesor_apellido}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Apellido del profe. Mínimo 2 caracteres.</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="ramo_nombre">Ramo</Label>
              <Input
                id="ramo_nombre"
                placeholder="Ej: Cálculo I, Programación Orientada a Objetos"
                value={form.ramo_nombre}
                onChange={(e) => setForm(f => ({ ...f, ramo_nombre: e.target.value }))}
                onBlur={() => markTouched('ramo_nombre')}
                autoComplete="off"
                className={touched.ramo_nombre && errors.ramo_nombre ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {touched.ramo_nombre && errors.ramo_nombre ? (
                <p className="text-xs text-destructive">{errors.ramo_nombre}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Nombre de la asignatura que tomaste con este profe.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="carrera_nombre">Carrera <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="carrera_nombre"
                placeholder="Ej: Ingeniería en Informática"
                value={form.carrera_nombre}
                onChange={(e) => setForm(f => ({ ...f, carrera_nombre: e.target.value }))}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Opcional. Carrera a la que pertenece el ramo.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semestre">Semestre cursado</Label>
              <Input
                id="semestre"
                placeholder='Ej: "2024-2" o "primer semestre de 2026"'
                value={form.semestre}
                onChange={(e) => setForm(f => ({ ...f, semestre: e.target.value }))}
                onBlur={() => markTouched('semestre')}
                autoComplete="off"
                className={touched.semestre && errors.semestre ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {touched.semestre && errors.semestre ? (
                <p className="text-xs text-destructive">{errors.semestre}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Puede ser numérico (2024-2) o en palabras ("primer semestre de 2026").</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg shrink-0">
                  <Star className="h-5 w-5 text-amber-600 fill-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-normal">Paso 2</span>
                    <span className="text-muted-foreground font-normal">·</span>
                    Calificaciones
                  </CardTitle>
                  <CardDescription>Haz clic en las estrellas para puntuar (1 a 5). Debes puntuar las 4.</CardDescription>
                </div>
              </div>
              {section2Complete && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(RATING_LABELS) as Array<
              'calificacion_general' | 'calificacion_explicacion' | 'calificacion_exigencia' | 'calificacion_accesibilidad'
            >).map((key) => {
              const value = form[key]
              const puntuado = value > 0
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors ${
                    puntuado
                      ? 'bg-amber-50/60 border-amber-200/70'
                      : 'bg-secondary/40 border-border hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      {RATING_LABELS[key].label}
                      {!puntuado && <span className="text-destructive">*</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{RATING_LABELS[key].desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RatingStars
                      value={value}
                      size="lg"
                      interactive
                      onChange={(v) => setRating(key, v)}
                    />
                    <span className={`text-sm font-bold w-8 text-right tabular-nums ${puntuado ? 'text-amber-600' : 'text-muted-foreground/50'}`}>
                      {puntuado ? `${value}/5` : '–/5'}
                    </span>
                  </div>
                </div>
              )
            })}
            {ratingsMissing && (
              <p className="text-xs text-destructive pt-1">Faltan categorías por puntuar (marcadas con *).</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-lg shrink-0">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-normal">Paso 3</span>
                    <span className="text-muted-foreground font-normal">·</span>
                    Comentario
                  </CardTitle>
                  <CardDescription>Mínimo 20 caracteres, máximo 500. Sé honesto y respetuoso.</CardDescription>
                </div>
              </div>
              {section3Complete && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Cuéntale a tus compañeros cómo es tomar clase con este profe: metodología, exigencia, trato..."
              value={form.comentario}
              onChange={(e) => setForm(f => ({ ...f, comentario: e.target.value }))}
              onBlur={() => markTouched('comentario')}
              rows={4}
              maxLength={500}
              className={touched.comentario && errors.comentario ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            <div className="flex justify-between mt-1.5">
              {touched.comentario && errors.comentario ? (
                <p className="text-xs text-destructive">{errors.comentario}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Mínimo 20 caracteres.</p>
              )}
              <p className="text-xs text-muted-foreground">{form.comentario.length}/500</p>
            </div>
          </CardContent>
        </Card>

        {!isValido && missingSummary.length > 0 && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive mb-2">Antes de publicar, completa:</p>
            <ul className="text-xs text-destructive/90 space-y-1 list-disc list-inside">
              {missingSummary.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        <Button
          type="submit"
          className="w-full shadow-lg shadow-primary/20"
          size="lg"
          disabled={!isValido || submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
          ) : (
            <><Send className="h-4 w-4" /> Publicar Reseña Anónima</>
          )}
        </Button>
      </form>
    </main>
  )
}
