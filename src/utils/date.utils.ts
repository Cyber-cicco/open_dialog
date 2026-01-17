export function formatDateFr(date: Date | undefined) {
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date?.toLocaleDateString('fr-FR', options) ?? "non précisée"
}

