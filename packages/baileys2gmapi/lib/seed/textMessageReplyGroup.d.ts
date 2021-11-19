declare const textMessageReplyGroup: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
        participant: string;
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
    };
    messageTimestamp: string;
    participant: string;
    pushName: string;
};
export { textMessageReplyGroup };
