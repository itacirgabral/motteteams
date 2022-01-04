"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postalScraper = void 0;
const postalScraper = function postalScraper(message) {
    const wid = message?.key?.id || '';
    const from = message?.key?.fromMe ? 'me' : message?.key?.remoteJid?.split('@')[0] || '';
    const to = message?.key?.fromMe ? message?.key?.remoteJid?.split('@')[0] || '' : 'me';
    const timestamp = String(message?.messageTimestamp);
    const author = message?.key?.participant?.split('@')[0];
    const hasQuoted = !!message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const reply = hasQuoted ? message?.message?.extendedTextMessage?.contextInfo?.stanzaId : undefined;
    const forward0 = message?.message?.audioMessage?.contextInfo?.isForwarded;
    const forward1 = message?.message?.imageMessage?.contextInfo?.isForwarded;
    const forward2 = message?.message?.videoMessage?.contextInfo?.isForwarded;
    const forward3 = message?.message?.contactMessage?.contextInfo?.isForwarded;
    const forward4 = message?.message?.documentMessage?.contextInfo?.isForwarded;
    const forward5 = message?.message?.locationMessage?.contextInfo?.isForwarded;
    const forward6 = message?.message?.extendedTextMessage?.contextInfo?.isForwarded;
    const anyForward = !!forward0 ||
        !!forward1 ||
        !!forward2 ||
        !!forward3 ||
        !!forward4 ||
        !!forward5 ||
        !!forward6;
    const forward = anyForward ? true : undefined;
    const postData = {
        wid,
        from,
        to,
        timestamp,
        author,
        reply,
        forward
    };
    return postData;
};
exports.postalScraper = postalScraper;
