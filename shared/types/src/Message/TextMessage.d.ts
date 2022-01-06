/**
 * * Tipo TextMessage, mensagem de texto
 */

export interface TextMessage {
  type: "textMessage";
  wid: string;
  from: string;
  to: string;
  timestamp: string;
  msg: string;
  author?: string;
  reply?: string;
  forward?: boolean;
}
