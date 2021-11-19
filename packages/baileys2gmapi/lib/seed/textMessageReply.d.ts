declare const textMessageReply: {
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
                stanzaId: string;
                participant: string;
                quotedMessage: {
                    conversation: string;
                };
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
export { textMessageReply };
