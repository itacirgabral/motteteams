declare const panoptickey: string;
declare const bornskey: string;
declare const mkcredskey: ({ shard }: {
    shard: string;
}) => string;
declare const mkbookphonekey: ({ shard }: {
    shard: string;
}) => string;
declare const mkchatkey: ({ shard }: {
    shard: string;
}) => string;
declare const mkwebhookkey: ({ shard }: {
    shard: string;
}) => string;
declare const mkstatekey: ({ shard }: {
    shard: string;
}) => string;
declare const mkstmkey: ({ shard }: {
    shard: string;
}) => string;
declare const mktskey: ({ shard, type }: {
    shard: string;
    type: string;
}) => string;
declare const mkqrcodekey: ({ shard, qrcode }: {
    shard: string;
    qrcode: string;
}) => string;
declare const mkpongkey: ({ shard }: {
    shard: string;
}) => string;
declare const mkfifokey: ({ shard }: {
    shard: string;
}) => string;
declare const mkofifkey: ({ shard }: {
    shard: string;
}) => string;
export { panoptickey, bornskey, mkcredskey, mkbookphonekey, mkchatkey, mkstatekey, mkstmkey, mktskey, mkqrcodekey, mkpongkey, mkfifokey, mkofifkey, mkwebhookkey };
