// TEMPLATE FILE — part of admin-template v1.0
export function exportCsv(data, filename = 'export.csv') {
  if (!data?.length) return
  const keys = Object.keys(data[0])
  const header = keys.join(',')
  const rows = data.map((row) =>
    keys.map((k) => JSON.stringify(row[k] ?? '')).join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
