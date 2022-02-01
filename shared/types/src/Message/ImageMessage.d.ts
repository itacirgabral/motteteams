/**
 * * Tipo ImageMessage, mensagem de imagem
 */

export interface ImageMessage {
  type: "imageMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  mimetype: string;
  bytes: string;
  caption: string;
  url?: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
