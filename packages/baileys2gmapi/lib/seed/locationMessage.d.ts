declare const locationMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        locationMessage: {
            degreesLatitude: number;
            degreesLongitude: number;
            jpegThumbnail: string;
        };
        messageContextInfo: {
            deviceListMetadata: {
                recipientKeyHash: string;
                recipientTimestamp: string;
            };
            deviceListMetadataVersion: number;
        };
    };
    messageTimestamp: string;
    pushName: string;
};
export { locationMessage };
