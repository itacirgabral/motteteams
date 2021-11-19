declare const imageMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        imageMessage: {
            url: string;
            mimetype: string;
            fileSha256: string;
            fileLength: string;
            height: number;
            width: number;
            mediaKey: string;
            fileEncSha256: string;
            directPath: string;
            mediaKeyTimestamp: string;
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
export { imageMessage };
