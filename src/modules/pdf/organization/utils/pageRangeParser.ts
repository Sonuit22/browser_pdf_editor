export type PageRangeError = { token: string; message: string };
export type PageRangeParseResult = { indices: number[]; errors: PageRangeError[] };

type ParseOptions = { pageCount: number; preserveOrder?: boolean };

export function parsePageRange(input: string, { pageCount, preserveOrder = true }: ParseOptions): PageRangeParseResult {
    const errors: PageRangeError[] = [];
    const indices: number[] = [];
    const seen = new Set<number>();
    const tokens = input.split(',').map((token) => token.trim()).filter(Boolean);

    if (!tokens.length) return { indices: [], errors: [{ token: input, message: 'Enter at least one page or range.' }] };

    for (const token of tokens) {
        const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);
        if (!match) {
            errors.push({ token, message: 'Use page numbers or inclusive ranges such as 1-3.' });
            continue;
        }
        const start = Number(match[1]);
        const end = Number(match[2] ?? match[1]);
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < 1) {
            errors.push({ token, message: 'Page numbers must be positive integers.' });
            continue;
        }
        if (end < start) {
            errors.push({ token, message: 'Ranges must run from a lower page number to a higher one.' });
            continue;
        }
        if (end > pageCount) {
            errors.push({ token, message: `The document has ${pageCount} page${pageCount === 1 ? '' : 's'}.` });
            continue;
        }
        for (let page = start; page <= end; page += 1) {
            const index = page - 1;
            if (!seen.has(index)) {
                seen.add(index);
                indices.push(index);
            }
        }
    }

    return { indices: preserveOrder ? indices : [...indices].sort((left, right) => left - right), errors };
}

export function parsePageRangeGroups(input: string, options: ParseOptions): { groups: number[][]; errors: PageRangeError[] } {
    const groups: number[][] = [];
    const errors: PageRangeError[] = [];
    for (const token of input.split(',').map((value) => value.trim()).filter(Boolean)) {
        const result = parsePageRange(token, options);
        if (result.errors.length) errors.push(...result.errors);
        else if (result.indices.length) groups.push(result.indices);
    }
    return { groups, errors };
}
