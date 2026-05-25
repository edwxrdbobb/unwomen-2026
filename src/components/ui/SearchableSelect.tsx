'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Search, X, ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  avatar?: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  emptyMessage?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  emptyMessage = 'No results found',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const selected = options.find(o => o.value === value)

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        o.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : options

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative h-auto" id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center gap-2 pl-3 pr-2 py-2.5 text-sm border-2 rounded-xl outline-none transition-colors text-left ${
          disabled
            ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
            : open
            ? 'border-[#399edc] bg-white dark:bg-gray-700'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
        }`}
      >
        {selected ? (
          <>
            {selected.avatar && (
              <img src={selected.avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
            )}
            {!selected.avatar && (
              <div className="w-6 h-6 rounded-full bg-[#399edc]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#399edc]">
                  {selected.label.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">{selected.label}</p>
              {selected.sublabel && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">{selected.sublabel}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 text-gray-400 dark:text-gray-500">{placeholder}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[500] top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              {query && (
                <button onClick={() => setQuery('')} className="flex-shrink-0">
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">{emptyMessage}</li>
            ) : (
              filtered.map(opt => {
                const isSelected = opt.value === value
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-[#399edc]/10 dark:bg-[#399edc]/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      {opt.avatar ? (
                        <img src={opt.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#399edc]/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#399edc]">
                            {opt.label.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-[#399edc]' : 'text-gray-800 dark:text-gray-100'}`}>
                          {opt.label}
                        </p>
                        {opt.sublabel && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{opt.sublabel}</p>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#399edc] flex-shrink-0" />}
                    </button>
                  </li>
                )
              })
            )}
          </ul>

          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-50 dark:border-gray-700">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {filtered.length} of {options.length} result{options.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
