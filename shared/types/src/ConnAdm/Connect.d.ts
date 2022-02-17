/**
 * * Tipo Connect, requisita a conexão de uma instância
 */

export interface Connect {
  type: "connect";
  hardid: string;
  shard: string;
  cacapa: string;
  auth?: string;
  drummerStartAt?: string;
}
