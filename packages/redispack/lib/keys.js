"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkwebhookkey = exports.mkofifkey = exports.mkfifokey = exports.mkpongkey = exports.mkqrcodekey = exports.mktskey = exports.mkstmkey = exports.mkstatekey = exports.mkchatkey = exports.mkbookphonekey = exports.mkcredskey = exports.bornskey = exports.panoptickey = void 0;
const hardid = process.env.HARDID || 'dev';
const panoptickey = `hardid:${hardid}:panoptic`;
exports.panoptickey = panoptickey;
const bornskey = `hardid:${hardid}:borns`;
exports.bornskey = bornskey;
const mkcredskey = function mkcredskey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:creds`;
};
exports.mkcredskey = mkcredskey;
const mkbookphonekey = function mkbookphonekey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:bookphone`;
};
exports.mkbookphonekey = mkbookphonekey;
const mkchatkey = function mkchatkey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:chat`;
};
exports.mkchatkey = mkchatkey;
const mkwebhookkey = function mkwebhookkey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:webhook`;
};
exports.mkwebhookkey = mkwebhookkey;
const mkstatekey = function mkstatekey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:state`;
};
exports.mkstatekey = mkstatekey;
const mkstmkey = function mkstmkey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:stm`;
};
exports.mkstmkey = mkstmkey;
const mktskey = function mktskey({ shard, type }) {
    return `hardid:${hardid}:zap:${shard}:timeserie:${type}`;
};
exports.mktskey = mktskey;
const mkqrcodekey = function mkqrcodekey({ shard, qrcode }) {
    return `hardid:${hardid}:zap:${shard}:qrcode:${qrcode}`;
};
exports.mkqrcodekey = mkqrcodekey;
const mkpongkey = function mkpongkey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:pong`;
};
exports.mkpongkey = mkpongkey;
const mkfifokey = function mkfifokey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:fifo`;
};
exports.mkfifokey = mkfifokey;
const mkofifkey = function mkofifkey({ shard }) {
    return `hardid:${hardid}:zap:${shard}:ofif`;
};
exports.mkofifkey = mkofifkey;
//# sourceMappingURL=keys.js.map