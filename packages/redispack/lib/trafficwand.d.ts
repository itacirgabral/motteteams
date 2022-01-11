import { Redis } from 'ioredis';
import { Observable } from 'rxjs';
declare type Bread = {
    [key: string]: string;
};
declare const stream2bread: ({ log }: {
    log: Array<string>;
}) => Bread;
declare const trafficwand: ({ redis, streamkey }: {
    redis: Redis;
    streamkey: string;
}) => Observable<Bread>;
export { trafficwand, Bread, stream2bread };
