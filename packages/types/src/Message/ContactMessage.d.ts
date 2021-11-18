/**
 * * Tipo ContactMessage, mensagem de contato
 */

export interface ContactMessage {
  type: "contactMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  vcard: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
