/**
 * * Tipo DocumentMessage, mensagem de documento
 */

export interface DocumentMessage {
  type: "documentMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  mimetype: string;
  bytes: string;
  filename: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
