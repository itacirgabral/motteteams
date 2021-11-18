/**
 * * Tipo LocationMessage, mensagem de localização
 */

export interface LocationMessage {
  type: "locationMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  description: string;
  latitude: string;
  longitude: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
