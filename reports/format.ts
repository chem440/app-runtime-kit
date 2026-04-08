/**
 * REPORT FORMATTING UTILITIES
 *
 * Consistent formatting for report values.
 */

export function formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null || Number.isNaN(num)) {
        return '0'
    }
    return num.toLocaleString()
}

export function formatCost(cost: number | undefined | null): string {
    if (cost === undefined || cost === null || Number.isNaN(cost)) {
        return '$0.00'
    }
    if (cost < 0.01) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
}

export function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

export function formatBytes(bytes: number | undefined | null): string {
    if (bytes === undefined || bytes === null || Number.isNaN(bytes)) {
        return '0 B'
    }
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function formatPercent(value: number | undefined | null, total: number | undefined | null, decimals = 0): string {
    if (value === undefined || value === null || Number.isNaN(value)) return '0%'
    if (total === undefined || total === null || Number.isNaN(total) || total === 0) return '0%'
    return `${((value / total) * 100).toFixed(decimals)}%`
}
