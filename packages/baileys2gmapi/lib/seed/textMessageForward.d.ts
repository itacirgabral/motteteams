declare const textMessageForward: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        extendedTextMessage: {
            text: string;
            previewType: string;
            contextInfo: {
                forwardingScore: number;
                isForwarded: boolean;
            };
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
export { textMessageForward };
