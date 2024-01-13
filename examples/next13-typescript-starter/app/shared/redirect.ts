export function appendRedirectParam(url: string, redirectUrl: string | null) {
    if (redirectUrl) {
        return `${url}?redirect=${redirectUrl}`;
    }

    return url;
}
