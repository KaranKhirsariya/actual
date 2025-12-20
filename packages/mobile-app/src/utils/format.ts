/**
 * Formatting Utilities
 */

/**
 * Format amount (in cents) to currency string
 */
export function formatCurrency(amount: number): string {
    const value = amount / 100;
    const isNegative = value < 0;
    const formatted = Math.abs(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return isNegative ? `-${formatted}` : formatted;
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format date with year
 */
export function formatDateLong(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format month string (YYYY-MM) to readable format
 */
export function formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format month string (YYYY-MM) to short format
 */
export function formatMonthShort(monthString: string): string {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

    return formatDate(date.toISOString().split('T')[0]);
}
