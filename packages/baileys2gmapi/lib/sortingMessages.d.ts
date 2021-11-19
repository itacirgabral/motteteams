declare const sortingMessages: ({ conversation, quoteMsg, location, contact, image, document, audio, video, appNotification }: {
    conversation: any;
    quoteMsg: any;
    location: any;
    contact: any;
    image: any;
    document: any;
    audio: any;
    video: any;
    appNotification: any;
}) => {
    type: any;
    isForwarded: boolean;
    isQuoted: boolean;
    msg: any;
};
