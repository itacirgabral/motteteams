interface PostalData {
    wid: string;
    from: string;
    to: string;
    timestamp: string;
    author?: string;
    reply?: string;
    forward?: boolean;
}
declare const postalScraper: (message: any) => PostalData;
export { postalScraper, PostalData };
