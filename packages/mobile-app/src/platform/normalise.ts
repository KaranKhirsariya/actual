/**
 * Unicode-aware string normalization for SQLite
 */

export function normalise(value: string | null): string | null {
    if (!value) {
        return null;
    }

    // Basic Unicode normalization - convert to NFD form and remove diacritics
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}
