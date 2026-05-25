'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)

  // Build page window: always show first, last, current ±1, with ellipsis gaps
  const pages: (number | '…')[] = []
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n) }

  add(1)
  if (currentPage > 3) pages.push('…')
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) add(i)
  if (currentPage < totalPages - 2) pages.push('…')
  if (totalPages > 1) add(totalPages)

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Showing {from}–{to} of {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-[#399edc] hover:border-[#399edc] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === p
                  ? 'text-white'
                  : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              style={currentPage === p ? { backgroundColor: '#399edc', borderColor: '#399edc' } : {}}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-[#399edc] hover:border-[#399edc] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
