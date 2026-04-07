export const TEXT_LIMITS = {
    password: 128,
    siteTitle: 80,
    siteDescription: 300,
    watermarkText: 60,
    photographerName: 40,
    photographerBio: 300,
    email: 254,
    accountName: 60,
    url: 500,
    tagName: 24,
    photoDescription: 200,
};
export function isWithinTextLimit(value, maxLength) {
    return value.length <= maxLength;
}
