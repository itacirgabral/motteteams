import { WAMessage } from '@adiwajshing/baileys-md';
import { Message } from '@gmapi/types';
declare const baileys2gmapi: (wam: WAMessage) => Message;
export default baileys2gmapi;
