declare const contactMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        contactMessage: {
            displayName: string;
            vcard: string;
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
export { contactMessage };
