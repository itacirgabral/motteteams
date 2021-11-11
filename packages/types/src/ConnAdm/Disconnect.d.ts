/**
 * * Tipo Disconnect, requisita para se desconectar
 */

export interface Disconnect {
  type: "disconnect";
  hardid: string;
  shard: string;
  cacapa: string;
}
