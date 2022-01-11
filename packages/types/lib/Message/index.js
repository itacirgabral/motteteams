"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDocumentMessageValidate = exports.isVideoMessageValidate = exports.isTextMessageValidate = exports.isLocationMessageValidate = exports.isImageMessageValidate = exports.isContactMessageValidate = exports.isAudioMessageValidate = void 0;
const audioMessage_1 = require("./audioMessage");
const contactMessage_1 = require("./contactMessage");
const imageMessage_1 = require("./imageMessage");
const locationMessage_1 = require("./locationMessage");
const textMessage_1 = require("./textMessage");
const videoMessage_1 = require("./videoMessage");
const documentMessage_1 = require("./documentMessage");
const isAudioMessageValidate = function isAudioMessageValidate(x) {
    return !!(0, audioMessage_1.audioMessageValidate)(x);
};
exports.isAudioMessageValidate = isAudioMessageValidate;
const isContactMessageValidate = function isContactMessageValidate(x) {
    return !!(0, contactMessage_1.contactMessageValidate)(x);
};
exports.isContactMessageValidate = isContactMessageValidate;
const isImageMessageValidate = function isImageMessageValidate(x) {
    return !!(0, imageMessage_1.imageMessageValidate)(x);
};
exports.isImageMessageValidate = isImageMessageValidate;
const isLocationMessageValidate = function isLocationMessageValidate(x) {
    return !!(0, locationMessage_1.locationMessageValidate)(x);
};
exports.isLocationMessageValidate = isLocationMessageValidate;
const isTextMessageValidate = function isTextMessage(x) {
    return !!(0, textMessage_1.textMessageValidate)(x);
};
exports.isTextMessageValidate = isTextMessageValidate;
const isVideoMessageValidate = function isVideoMessageValidate(x) {
    return !!(0, videoMessage_1.videoMessageValidate)(x);
};
exports.isVideoMessageValidate = isVideoMessageValidate;
const isDocumentMessageValidate = function isVideoMessageValidate(x) {
    return !!(0, documentMessage_1.documentMessageValidate)(x);
};
exports.isDocumentMessageValidate = isDocumentMessageValidate;
