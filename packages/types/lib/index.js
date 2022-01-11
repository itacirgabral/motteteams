"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMessage = exports.isConnAdm = void 0;
const ConnAdm_1 = require("./ConnAdm");
const Message_1 = require("./Message");
const isMessage = {
    isAudioMessageValidate: Message_1.isAudioMessageValidate,
    isContactMessageValidate: Message_1.isContactMessageValidate,
    isImageMessageValidate: Message_1.isImageMessageValidate,
    isLocationMessageValidate: Message_1.isLocationMessageValidate,
    isTextMessageValidate: Message_1.isTextMessageValidate,
    isVideoMessageValidate: Message_1.isVideoMessageValidate,
    isDocumentMessageValidate: Message_1.isDocumentMessageValidate
};
exports.isMessage = isMessage;
const isConnAdm = {
    isConnect: ConnAdm_1.isConnect,
    isConnectionstate: ConnAdm_1.isConnectionstate,
    isDisconnect: ConnAdm_1.isDisconnect,
    isSignupconnection: ConnAdm_1.isSignupconnection
};
exports.isConnAdm = isConnAdm;
