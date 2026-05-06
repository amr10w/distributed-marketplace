import wsClient from './wsClient'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

const safeParse = (raw) => {
  if (raw == null) return null
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const mapReport = (r) => ({
  id: r.ReportId,
  generatedBy: r.GeneratedBy,
  reportType: r.ReportType,
  parameters: safeParse(r.Parameters),
  resultSnapshot: safeParse(r.ResultSnapshot),
  generatedAt: r.GeneratedAt,
})

export const reportsApi = {
  getActivityLog: async (userId, reportType) => {
    const payload = { UserId: userId }
    if (reportType) payload.ReportType = reportType

    const envelope = await wsClient.send('GET_USER_REPORTS', payload)
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_USER_REPORTS_SUCCESS') {
      const reports = Array.isArray(data.Reports) ? data.Reports.map(mapReport) : []
      return { success: true, reports }
    }
    return { success: false, error: data.Message || 'Failed to load activity log', reports: [] }
  },

  getTransactionReport: async () => {},
  getSalesReport: async () => {},
  getPurchaseReport: async () => {},
}
