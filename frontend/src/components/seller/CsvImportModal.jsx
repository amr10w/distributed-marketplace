import { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { itemsApi } from '../../api/itemsApi'
import { CATEGORY_IDS } from '../../lib/constants'

const REQUIRED_COLUMNS = ['name', 'category', 'price', 'quantity']
const OPTIONAL_COLUMNS = ['brand', 'description', 'imageUrl']
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

const TEMPLATE_CSV =
  'name,brand,category,price,quantity,description,imageUrl\n' +
  'iPhone 15 Pro,Apple,Electronics,999.99,5,Latest model,\n' +
  'Cotton Hoodie,Nike,Fashion,49.50,20,Soft and warm,\n'

const parseCsv = (text) => {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++
        row.push(field)
        field = ''
        if (row.some((v) => v.trim().length > 0)) rows.push(row)
        row = []
      } else {
        field += c
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((v) => v.trim().length > 0)) rows.push(row)
  }
  return rows
}

const validateRow = (raw) => {
  const errors = []
  const name = (raw.name || '').trim()
  const category = (raw.category || '').trim()
  const priceStr = (raw.price || '').trim()
  const quantityStr = (raw.quantity || '').trim()

  if (!name) errors.push('name required')
  if (!category) errors.push('category required')
  if (!CATEGORY_IDS[category]) {
    errors.push(`category must be one of ${Object.keys(CATEGORY_IDS).join(', ')}`)
  }
  const price = parseFloat(priceStr.replace(/[$,]/g, ''))
  if (!Number.isFinite(price) || price <= 0) errors.push('price must be > 0')
  const quantity = parseInt(quantityStr, 10)
  if (!Number.isInteger(quantity) || quantity < 0) errors.push('quantity must be >= 0')

  return {
    parsed: {
      name,
      brand: (raw.brand || '').trim() || null,
      description: (raw.description || '').trim() || null,
      category,
      categoryId: CATEGORY_IDS[category],
      price,
      quantity,
      imageUrl: (raw.imageUrl || '').trim() || null,
    },
    errors,
  }
}

const CsvImportModal = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState([])
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [results, setResults] = useState(null)

  if (!isOpen) return null

  const reset = () => {
    setFileName('')
    setRows([])
    setParseError('')
    setProgress({ done: 0, total: 0 })
    setResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (importing) return
    reset()
    onClose()
  }

  const handleFile = async (file) => {
    setParseError('')
    setResults(null)
    setRows([])
    if (!file) return
    setFileName(file.name)
    try {
      const text = await file.text()
      const matrix = parseCsv(text)
      if (matrix.length < 2) {
        setParseError('CSV must include a header row and at least one data row.')
        return
      }
      const header = matrix[0].map((h) => h.trim())
      const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
      if (missing.length > 0) {
        setParseError(`Missing required column(s): ${missing.join(', ')}`)
        return
      }

      const dataRows = matrix.slice(1).map((cells, idx) => {
        const raw = {}
        ALL_COLUMNS.forEach((col) => {
          const ci = header.indexOf(col)
          raw[col] = ci >= 0 ? (cells[ci] ?? '') : ''
        })
        const { parsed, errors } = validateRow(raw)
        return {
          rowNumber: idx + 2,
          raw,
          parsed,
          errors,
          status: errors.length === 0 ? 'valid' : 'invalid',
        }
      })
      setRows(dataRows)
    } catch (err) {
      setParseError(err.message || 'Failed to read file')
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!user || !user.storeId) {
      toast.error('You need a store before importing items.')
      return
    }
    const validRows = rows.filter((r) => r.status === 'valid')
    if (validRows.length === 0) {
      toast.warning('No valid rows to import.')
      return
    }

    setImporting(true)
    setProgress({ done: 0, total: validRows.length })
    const successes = []
    const failures = []

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i]
      try {
        const result = await itemsApi.addItem({
          requestingUserId: user.id,
          storeId: user.storeId,
          categoryId: r.parsed.categoryId,
          name: r.parsed.name,
          brand: r.parsed.brand,
          description: r.parsed.description,
          price: r.parsed.price,
          stockQuantity: r.parsed.quantity,
          imageUrl: r.parsed.imageUrl,
        })
        if (result.success) {
          successes.push({ rowNumber: r.rowNumber, name: r.parsed.name })
        } else {
          failures.push({
            rowNumber: r.rowNumber,
            name: r.parsed.name,
            error: result.error || 'Unknown error',
          })
        }
      } catch (err) {
        failures.push({
          rowNumber: r.rowNumber,
          name: r.parsed.name,
          error: err.message || 'Network error',
        })
      }
      setProgress({ done: i + 1, total: validRows.length })
    }

    const skipped = rows
      .filter((r) => r.status === 'invalid')
      .map((r) => ({
        rowNumber: r.rowNumber,
        name: r.parsed.name || '(no name)',
        error: r.errors.join('; '),
      }))

    setResults({
      imported: successes.length,
      failed: failures.length,
      skipped: skipped.length,
      failureDetails: [...failures, ...skipped],
    })
    setImporting(false)
    if (successes.length > 0) {
      toast.success(`Imported ${successes.length} product${successes.length === 1 ? '' : 's'}`)
      onComplete?.()
    }
  }

  const validCount = rows.filter((r) => r.status === 'valid').length
  const invalidCount = rows.filter((r) => r.status === 'invalid').length

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-700 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Import Products from CSV</h3>
            <p className="text-xs text-slate-400 mt-1">
              Required columns: {REQUIRED_COLUMNS.join(', ')}. Optional: {OPTIONAL_COLUMNS.join(', ')}.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={importing}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none disabled:opacity-30"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!results && (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  disabled={importing}
                  className="text-sm text-slate-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-gold-500 file:text-white file:font-medium file:cursor-pointer"
                />
                <button
                  onClick={downloadTemplate}
                  type="button"
                  className="text-sm text-gold-400 hover:underline font-medium"
                >
                  Download template
                </button>
                {fileName && <span className="text-xs text-slate-400">Loaded: {fileName}</span>}
              </div>

              {parseError && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {parseError}
                </div>
              )}

              {rows.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                      <p className="text-slate-400 text-xs">Total rows</p>
                      <p className="font-bold text-slate-100">{rows.length}</p>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg px-4 py-2">
                      <p className="text-emerald-300 text-xs">Valid</p>
                      <p className="font-bold text-emerald-300">{validCount}</p>
                    </div>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                      <p className="text-red-300 text-xs">Will be skipped</p>
                      <p className="font-bold text-red-300">{invalidCount}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Category</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Qty</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {rows.map((r) => (
                          <tr key={r.rowNumber} className="hover:bg-slate-900/50">
                            <td className="px-3 py-2 text-slate-500">{r.rowNumber}</td>
                            <td className="px-3 py-2 text-slate-100">{r.parsed.name || '—'}</td>
                            <td className="px-3 py-2 text-slate-300">{r.parsed.category || '—'}</td>
                            <td className="px-3 py-2 text-slate-300">
                              {Number.isFinite(r.parsed.price) ? r.parsed.price.toFixed(2) : '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-300">
                              {Number.isInteger(r.parsed.quantity) ? r.parsed.quantity : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {r.status === 'valid' ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-800">
                                  ✓ Valid
                                </span>
                              ) : (
                                <span
                                  className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-800"
                                  title={r.errors.join('; ')}
                                >
                                  ✗ {r.errors[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {importing && (
                <div className="mt-4">
                  <p className="text-sm text-slate-300 mb-1">
                    Importing {progress.done} of {progress.total}…
                  </p>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gold-500 transition-all"
                      style={{
                        width:
                          progress.total > 0
                            ? `${Math.round((progress.done / progress.total) * 100)}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {results && (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg px-4 py-3">
                  <p className="text-emerald-300 text-xs">Imported</p>
                  <p className="font-bold text-emerald-300 text-2xl">{results.imported}</p>
                </div>
                <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                  <p className="text-red-300 text-xs">Failed</p>
                  <p className="font-bold text-red-300 text-2xl">{results.failed}</p>
                </div>
                <div className="bg-amber-900/20 border border-gold-700 rounded-lg px-4 py-3">
                  <p className="text-gold-300 text-xs">Skipped (invalid)</p>
                  <p className="font-bold text-gold-300 text-2xl">{results.skipped}</p>
                </div>
              </div>

              {results.failureDetails.length > 0 && (
                <div className="rounded-lg border border-slate-700 overflow-hidden">
                  <p className="bg-slate-900 px-4 py-2 text-xs text-slate-400 font-medium">
                    Issues
                  </p>
                  <ul className="divide-y divide-slate-700 max-h-72 overflow-y-auto">
                    {results.failureDetails.map((f, idx) => (
                      <li key={idx} className="px-4 py-2 text-sm">
                        <span className="text-slate-500">Row {f.rowNumber}:</span>{' '}
                        <span className="text-slate-200">{f.name}</span>{' '}
                        <span className="text-red-400">— {f.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
          {!results ? (
            <>
              <button
                onClick={handleClose}
                disabled={importing}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-900 text-slate-200 font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing
                  ? 'Importing…'
                  : validCount > 0
                  ? `Import ${validCount} valid row${validCount === 1 ? '' : 's'}`
                  : 'Import'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={reset}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-900 text-slate-200 font-medium transition"
              >
                Import Another File
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 font-medium transition"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CsvImportModal
