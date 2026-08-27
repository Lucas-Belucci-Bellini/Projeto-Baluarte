import { useTimezone } from '@/composables/useTimezone'

const FALLBACK_TAG_COLOR = '#0ea5e9'
const timezone = useTimezone()

const formatDateForTimelineQuery = (dateValue) => {
  const timestamp = toEpochMs(dateValue)
  if (timestamp === null) return null
  return timezone.formatUrlDate(new Date(timestamp).toISOString())
}

const toEpochMs = (value) => {
  if (!value) return null

  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isFinite(time) ? time : null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

const getTagRange = (tag) => {
  const startMs = toEpochMs(tag?.startTime)
  if (startMs === null) return null

  // Active tags can have a null end; treat as open-ended for overlap checks.
  const endMs = tag?.endTime ? toEpochMs(tag.endTime) : Number.POSITIVE_INFINITY
  if (endMs === null) return null

  return { startMs, endMs }
}

const selectBestTag = (matchingTags) => {
  if (!matchingTags.length) return null

  return [...matchingTags].sort((a, b) => {
    const aStart = toEpochMs(a.startTime) ?? 0
    const bStart = toEpochMs(b.startTime) ?? 0
    return bStart - aStart
  })[0]
}

export const normalizePeriodTagColor = (color) => {
  if (!color || typeof color !== 'string') return FALLBACK_TAG_COLOR
  return color.startsWith('#') ? color : `#${color}`
}

export const buildTimelineQueryForPeriodTag = (tag) => {
  if (!tag?.startTime) return null

  const start = formatDateForTimelineQuery(tag.startTime)
  const end = formatDateForTimelineQuery(tag.endTime || new Date())
  if (!start || !end) return null

  return { start, end }
}

export const findMatchingPeriodTagForInterval = (startTime, endTime, periodTags = []) => {
  const visitStartMs = toEpochMs(startTime)
  if (visitStartMs === null) return null

  const visitEndMs = toEpochMs(endTime) ?? visitStartMs

  const matches = periodTags.filter((tag) => {
    const tagRange = getTagRange(tag)
    if (!tagRange) return false
    return visitStartMs <= tagRange.endMs && visitEndMs >= tagRange.startMs
  })

  return selectBestTag(matches)
}

export const findMatchingPeriodTagForTimestamp = (timestamp, periodTags = []) => {
  return findMatchingPeriodTagForInterval(timestamp, timestamp, periodTags)
}

export const findMatchingPeriodTagForVisit = (visit, periodTags = []) => {
  if (!visit?.timestamp) return null

  const startMs = toEpochMs(visit.timestamp)
  if (startMs === null) return null

  const durationSeconds = Number(visit.stayDuration || 0)
  const endMs = durationSeconds > 0 ? startMs + (durationSeconds * 1000) : startMs

  return findMatchingPeriodTagForInterval(startMs, endMs, periodTags)
}

export const getEpochMs = toEpochMs
