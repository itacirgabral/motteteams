/**
 * * Tipo TextMessage, mensagem de video
 */

export interface VideoMessage {
  type: "videoMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  mimetype: string;
  bytes: string;
  seconds: string;
  gif: boolean;
  caption: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
