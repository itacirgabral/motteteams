declare const videoMessage: {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
    };
    message: {
        videoMessage: {
            url: string;
            mimetype: string;
            fileSha256: string;
            fileLength: string;
            seconds: number;
            mediaKey: string;
            gifPlayback: boolean;
            height: number;
            width: number;
            fileEncSha256: string;
            directPath: string;
            mediaKeyTimestamp: string;
            jpegThumbnail: string;
            gifAttribution: string;
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
export { videoMessage };
