declare const audioMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        audioMessage: {
            url: string;
            mimetype: string;
            fileSha256: string;
            fileLength: string;
            seconds: number;
            ptt: boolean;
            mediaKey: string;
            fileEncSha256: string;
            directPath: string;
            mediaKeyTimestamp: string;
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
export { audioMessage };
