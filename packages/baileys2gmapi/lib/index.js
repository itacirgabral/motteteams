"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postalScraper_1 = require("./postalScraper");
const baileys2gmapi = (wam) => {
    const { wid, from, to, timestamp, author, forward, reply } = (0, postalScraper_1.postalScraper)(wam);
    const conversation = !!wam?.message?.conversation;
    const extendedText = !!wam?.message?.extendedTextMessage;
    const location = !!wam?.message?.locationMessage;
    const contact = !!wam?.message?.contactMessage;
    if (conversation) {
        const type = 'textMessage';
        const msg = wam?.message?.conversation || '';
        const message = {
            type,
            wid,
            from,
            to,
            timestamp,
            msg,
            author,
            reply,
            forward
        };
        return message;
    }
    else if (extendedText) {
        const type = 'textMessage';
        const msg = wam?.message?.extendedTextMessage?.text || '';
        const message = {
            type,
            wid,
            from,
            to,
            timestamp,
            msg,
            author,
            reply,
            forward
        };
        return message;
    }
    else if (location) {
        const type = 'locationMessage';
        const description = wam?.message?.locationMessage?.address || '';
        const latitude = wam?.message?.locationMessage?.degreesLatitude || 0;
        const longitude = wam?.message?.locationMessage?.degreesLongitude || 0;
        const message = {
            type,
            wid,
            from,
            to,
            timestamp,
            description,
            latitude,
            longitude,
            author,
            reply,
            forward
        };
        return message;
    }
    else if (contact) {
        const type = 'contactMessage';
        const vcard = wam?.message?.contactMessage?.vcard || '';
        const message = {
            type,
            wid,
            from,
            to,
            timestamp,
            vcard,
            author,
            reply,
            forward
        };
        return message;
    }
    else {
        return { nada: true };
    }
};
exports.default = baileys2gmapi;
