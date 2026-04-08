function getPacificOffsetMs(date: Date): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        hourCycle: 'h23',
    })

    const ptParts = formatter.formatToParts(date)
    const ptHour = parseInt(ptParts.find(part => part.type === 'hour')?.value || '0', 10)
    const utcHour = date.getUTCHours()

    let offsetHours = ptHour - utcHour
    if (offsetHours > 12) offsetHours -= 24
    if (offsetHours < -12) offsetHours += 24

    return offsetHours * 60 * 60 * 1000
}

export function getWeekStartPT(date: Date = new Date()): Date {
    const ptOffsetMs = getPacificOffsetMs(date)
    const ptTime = date.getTime() + ptOffsetMs
    const ptDate = new Date(ptTime)
    const dayOfWeek = ptDate.getUTCDay()

    const sundayPT = new Date(ptDate)
    sundayPT.setUTCDate(sundayPT.getUTCDate() - dayOfWeek)
    sundayPT.setUTCHours(0, 0, 0, 0)

    const sundayPtOffsetMs = getPacificOffsetMs(sundayPT)
    return new Date(sundayPT.getTime() - sundayPtOffsetMs)
}

export function getWeekKey(date: Date = new Date()): string {
    const weekStart = getWeekStartPT(date)
    const year = weekStart.getUTCFullYear()
    const startOfYear = new Date(Date.UTC(year, 0, 1))
    const days = Math.floor((weekStart.getTime() - startOfYear.getTime()) / 86400000)
    const weekNum = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7)
    return `${year}-W${String(weekNum).padStart(2, '0')}`
}
