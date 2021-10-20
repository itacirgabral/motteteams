/**
 * * Tipo Queuerestart, requisita pra se reiniciar o baterista
 */

export interface Queuerestart {
  type: "queuerestart";
  hardid: string;
  shard: string;
  cacapa: string;
}
