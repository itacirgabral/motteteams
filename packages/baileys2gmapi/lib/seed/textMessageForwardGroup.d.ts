declare const textMessageForwardGroup: {
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
                forwardingScore: number;
                isForwarded: boolean;
            };
        };
    };
    messageTimestamp: string;
    participant: string;
    pushName: string;
};
export { textMessageForwardGroup };
