"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream2bread = exports.trafficwand = void 0;
const rxjs_1 = require("rxjs");
const stream2bread = function stream2bread({ log }) {
    const keys = log.filter((_el, i) => i % 2 === 0);
    const values = log.filter((_el, i) => i % 2 !== 0);
    const bread = {};
    for (let i = 0; i < keys.length; i++) {
        bread[keys[i] || ''] = values[i] || '';
    }
    return bread;
};
exports.stream2bread = stream2bread;
const trafficwand = function trafficwand({ redis, streamkey }) {
    return new rxjs_1.Observable(subscriber => {
        const redisBlock = redis.duplicate();
        let lastlogid = '$';
        (async () => {
            while (true) {
                const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', streamkey, lastlogid);
                for (const county of stream) {
                    const countyBody = county[1];
                    for (const log of countyBody) {
                        const logHead = log[0];
                        const logBody = log[1];
                        lastlogid = logHead;
                        const bread = stream2bread({ log: logBody });
                        subscriber.next(bread);
                    }
                }
            }
        })();
    });
};
exports.trafficwand = trafficwand;
//# sourceMappingURL=trafficwand.js.map