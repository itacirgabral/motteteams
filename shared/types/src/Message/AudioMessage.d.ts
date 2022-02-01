/**
 * * Tipo AudioMessage, mensagem de audiuo
 */

export interface AudioMessage {
  type: "audioMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  mimetype: string;
  bytes: string;
  url?: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
