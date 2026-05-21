/**
 * Canonical mobile for Egypt-style numbers (matches login vs register vs seed).
 * Strips spaces/dashes, maps +20 / 0020 / 20… to leading 0 national format.
 */
function normalizeMobile(input) {
    if (input == null) return '';
    let s = String(input).trim().replace(/[\s\-.]/g, '');

    const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
    for (let i = 0; i < 10; i++) {
        const re = new RegExp(arabicIndic[i], 'g');
        s = s.replace(re, String(i));
    }

    const digits = s.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('20') && digits.length >= 11 && digits[2] === '1') {
        return `0${digits.slice(2)}`;
    }
    if (digits.startsWith('0')) {
        return digits;
    }
    if (digits.startsWith('1') && digits.length >= 10) {
        return `0${digits}`;
    }
    return digits;
}

module.exports = { normalizeMobile };
