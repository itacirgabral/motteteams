/**
 * * Tipo Connectionstate, requisita o estado de uma conexão
 */

export interface Connectionstate {
  type: "connectionstate";
  hardid: string;
  shard: string;
  url: string;
  mitochondria: string;
  cacapa: string;
}
