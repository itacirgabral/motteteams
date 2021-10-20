/**
 * * Tipo Disconnect, requisita para se desconectar
 */

export interface Disconnect {
  type: "disconnect";
  hardid: string;
  shard: string;
  url: string;
  mitochondria: string;
  cacapa: string;
}
