/**
 * Shared authentication and user utilities for the Mentor Pilot system.
 */

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase.
 * Also removes common invisible characters that can be accidentally pasted.
 */
export function normalizeEmail(email: string | null | undefined): string {
    if (!email) return '';

    return email
        .trim()
        .toLowerCase()
        // Remove zero-width spaces, non-breaking spaces, and other invisible characters
        .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');
}

/**
 * Validates basic email format.
 */
export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
