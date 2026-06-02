'use client'

import { useState, useMemo } from 'react'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@cvx/_generated/api'
import { toast, Toaster } from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { CategoryIcon, ICON_MAP } from '@/components/ui/CategoryIcon'
import { cleanError } from '@/utils/formatError'
import type { Id } from '@cvx/_generated/dataModel'

// ── Icon picker groups ────────────────────────────────────────────────────────
const ICON_GROUPS: { label: string; names: string[] }[] = [
  { label: 'Commerce',         names: ['ShoppingBag','ShoppingCart','Store','Wallet','CreditCard','DollarSign','Package','Gift','BadgeDollarSign','BarChart2','TrendingUp','Boxes','Banknote','Percent','Receipt','Tag'] },
  { label: 'Food & Agri',      names: ['Wheat','Apple','Leaf','Cherry','Fish','Coffee','Milk','Sandwich','Salad','Soup','Utensils','ChefHat','Beef','Egg','Wine','Beer','Banana','Carrot','Grape','Sprout','TreeDeciduous','Tractor','Sun','Cloud','Droplets'] },
  { label: 'Beauty & Fashion', names: ['Sparkles','Heart','Flower2','Star','Gem','Crown','Palette','Brush','Scissors','Wand2','Shirt','Glasses','Watch','Footprints','Diamond'] },
  { label: 'Home',             names: ['Home','Sofa','Lightbulb','Flame','Key','Hammer','Wrench','Drill','BedDouble','Bath'] },
  { label: 'Electronics',      names: ['Smartphone','Laptop','Monitor','Headphones','Camera','Tv','Plug','Battery','Wifi','Radio','Cpu'] },
  { label: 'Office & Edu',     names: ['BookOpen','GraduationCap','FileText','Pen','Pencil','Clipboard','Paperclip','Printer'] },
  { label: 'Health',           names: ['Activity','Stethoscope','Pill','Syringe','Cross','HeartPulse','Dna'] },
  { label: 'Services',         names: ['Truck','Plane','Globe','Phone','Mail','MessageSquare','Users','Building','Car','Ship'] },
  { label: 'Sports',           names: ['Dumbbell','Trophy','Target','Bike','Music','Mic','Film','Gamepad2','Mountain','Waves'] },
  { label: 'General',         names: ['Zap','Rocket','Shield','Lock','Eye','Bell','MapPin','Clock'] },
]

// ── Icon Picker ───────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return ICON_GROUPS
    return ICON_GROUPS
      .map(g => ({ ...g, names: g.names.filter(n => n.toLowerCase().includes(q)) }))
      .filter(g => g.names.length > 0)
  }, [search])

  const PreviewIcon = ICON_MAP[value]

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Icon</label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2.5 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${
          open
            ? 'border-[#399edc] bg-[#eef7fd] dark:bg-[#1a3a50]/30'
            : 'border-gray-200 dark:border-gray-600 hover:border-[#399edc] dark:bg-gray-700'
        }`}>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${open ? 'bg-[#399edc]/10' : 'bg-gray-100 dark:bg-gray-600'}`}>
          {PreviewIcon
            ? <PreviewIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            : <span className="text-base leading-none">{value}</span>
          }
        </span>
        <span className="flex-1 text-gray-700 dark:text-gray-200 font-mono text-xs">{value}</span>
        <span className="text-xs text-[#399edc] font-semibold flex-shrink-0">{open ? 'Close ↑' : 'Change ↓'}</span>
      </button>

      {open && (
        <div className="mt-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search icons…"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
            </div>
          </div>

          <div className="overflow-y-auto max-h-72 px-3 py-3 space-y-4">
            {filtered.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.names.map(name => {
                    const Icon = ICON_MAP[name]
                    if (!Icon) return null
                    return (
                      <button key={name} type="button" title={name}
                        onClick={() => { onChange(name); setOpen(false); setSearch('') }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          value === name
                            ? 'bg-[#399edc] text-white shadow-md scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#eef7fd] dark:hover:bg-[#1a3a50]/60 hover:text-[#399edc]'
                        }`}>
                        <Icon className="w-4 h-4" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No icons found for "{search}"</p>
            )}
          </div>

          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Or type an emoji directly</p>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. 🛍️"
              className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Color options ─────────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { color: 'bg-pink-100',    text: 'text-pink-600' },
  { color: 'bg-purple-100',  text: 'text-purple-600' },
  { color: 'bg-yellow-100',  text: 'text-yellow-600' },
  { color: 'bg-orange-100',  text: 'text-orange-600' },
  { color: 'bg-green-100',   text: 'text-green-700' },
  { color: 'bg-teal-100',    text: 'text-teal-600' },
  { color: 'bg-blue-100',    text: 'text-blue-600' },
  { color: 'bg-indigo-100',  text: 'text-indigo-600' },
  { color: 'bg-emerald-100', text: 'text-emerald-600' },
  { color: 'bg-rose-100',    text: 'text-rose-600' },
  { color: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
  { color: 'bg-amber-100',   text: 'text-amber-600' },
  { color: 'bg-violet-100',  text: 'text-violet-600' },
  { color: 'bg-cyan-100',    text: 'text-cyan-600' },
  { color: 'bg-lime-100',    text: 'text-lime-700' },
  { color: 'bg-red-100',     text: 'text-red-600' },
  { color: 'bg-sky-100',     text: 'text-sky-600' },
  { color: 'bg-slate-100',   text: 'text-slate-600' },
]

const blankForm = {
  name: '', slug: '', description: '', emoji: 'ShoppingBag',
  color: 'bg-blue-100', textColor: 'text-blue-600',
  type: 'both' as 'products' | 'services' | 'both',
}

export default function AdminCategoriesPage() {
  const convex = useConvex()
  const categories = useQuery(api.categories.list) ?? []
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<Id<'categories'> | null>(null)
  const [form, setForm] = useState(blankForm)
  const [saving, setSaving] = useState(false)

  const slugify = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await convex.mutation(api.categories.create, form)
      toast.success('Category created!')
      setForm(blankForm)
      setShowCreate(false)
    } catch (err) {
      toast.error(cleanError(err, 'Failed to create category'))
    } finally { setSaving(false) }
  }

  const handleUpdate = async (id: Id<'categories'>) => {
    setSaving(true)
    try {
      await convex.mutation(api.categories.update, { id, ...form })
      toast.success('Category updated!')
      setEditingId(null)
    } catch (err) {
      toast.error(cleanError(err, 'Failed to update'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: Id<'categories'>, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      await convex.mutation(api.categories.remove, { id })
      toast.success('Category deleted')
    } catch { toast.error('Failed to delete category') }
  }

  const startEdit = (cat: typeof categories[0]) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, emoji: cat.emoji, color: cat.color, textColor: cat.textColor, type: cat.type })
    setEditingId(cat._id)
    setShowCreate(false)
  }

  const FormFields = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => void }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
          <input required value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
            placeholder="Category name"
            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Slug *</label>
          <input required value={form.slug}
            onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
            placeholder="category-slug"
            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white font-mono transition-colors" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description *</label>
          <textarea required value={form.description} rows={2}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Short description of this category"
            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors resize-none" />
        </div>

        <div className="sm:col-span-2">
          <IconPicker value={form.emoji} onChange={v => setForm(p => ({ ...p, emoji: v }))} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type *</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none focus:border-[#399edc] dark:bg-gray-700 dark:text-white transition-colors">
            <option value="products">Products only</option>
            <option value="services">Services only</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preview</label>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.color}`}>
            <CategoryIcon value={form.emoji} className={`w-5 h-5 ${form.textColor}`} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colour</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(({ color, text }) => (
              <button key={color} type="button"
                onClick={() => setForm(p => ({ ...p, color, textColor: text }))}
                className={`w-7 h-7 rounded-lg ${color} ${form.color === color ? 'ring-2 ring-offset-1 ring-[#399edc]' : ''} transition-all`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setShowCreate(false); setEditingId(null) }}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-colors"
          style={{ backgroundColor: '#399edc' }}>
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} product & service categories</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditingId(null) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
          style={{ backgroundColor: '#399edc' }}>
          {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreate ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" style={{ color: '#399edc' }} /> New Category
          </h2>
          <FormFields onSubmit={handleCreate} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
            {editingId === cat._id ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Editing: {cat.name}</h3>
                  <button onClick={() => setEditingId(null)}><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                <FormFields onSubmit={(e) => { e.preventDefault(); handleUpdate(cat._id) }} />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    <CategoryIcon value={cat.emoji} className={`w-5 h-5 ${cat.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{cat.name}</h3>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        cat.type === 'services' ? 'bg-purple-100 text-purple-600'
                        : cat.type === 'both' ? 'bg-sky-100 text-sky-600'
                        : 'bg-green-100 text-green-700'
                      }`}>
                        {cat.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{cat.description}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button onClick={() => startEdit(cat)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#399edc] hover:bg-[#eef7fd] px-2 py-1 rounded-lg transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(cat._id, cat.name)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
