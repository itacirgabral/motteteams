declare const textMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        conversation: string;
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
export { textMessage };
