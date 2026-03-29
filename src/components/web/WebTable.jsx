import { ChevronLeft, ChevronRight } from 'lucide-react'

export function WebPagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400">
        {page * pageSize + 1}~{Math.min((page + 1) * pageSize, total)} / {total}건
      </span>
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-gray-600">{page + 1} / {totalPages}</span>
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

export function WebTable({ columns, rows, loading, sort, onSort, emptyText = '데이터가 없습니다' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-gray-600 whitespace-nowrap ${col.width || ''} ${col.sortable ? 'cursor-pointer hover:text-gray-900' : ''}`}
                  onClick={col.sortable ? () => onSort?.(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sort?.col === col.key && (sort.asc ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">불러오는 중...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">{emptyText}</td></tr>
            ) : rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.tdClass || ''}`}>
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
