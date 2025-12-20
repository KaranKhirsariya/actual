/**
 * Unicode-aware LIKE pattern matching for SQLite
 */

import { LRUCache } from 'lru-cache';

const likePatternCache = new LRUCache<string, RegExp>({ max: 500 });

export function unicodeLike(
    pattern: string | null,
    value: string | null,
): number {
    if (!pattern) {
        return 0;
    }

    if (!value) {
        value = '';
    }

    let cachedRegExp = likePatternCache.get(pattern);
    if (!cachedRegExp) {
        const processedPattern = pattern
            .replace(/[.*+^${}()|[\]\\]/g, '\\$&')
            .replaceAll('?', '.')
            .replaceAll('%', '.*');
        cachedRegExp = new RegExp(processedPattern, 'i');
        likePatternCache.set(pattern, cachedRegExp);
    }

    return cachedRegExp.test(value) ? 1 : 0;
}
