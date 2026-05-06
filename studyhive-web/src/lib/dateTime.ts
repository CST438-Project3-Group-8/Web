export function formatDateTime(value: string | null | undefined) {
    if (!value) return 'Recently created';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export function formatDateOnly(value: string | null | undefined) {
    if (!value) return 'Recently created';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export function toDateTimeLocalValue(value: string | null | undefined) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string) {
    if (!value) return '';
    return new Date(value).toISOString();
}
