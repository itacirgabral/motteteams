import { Connect, Connectionstate, Disconnect, Signupconnection } from './ConnAdm';
import { AudioMessage, ContactMessage, ImageMessage, LocationMessage, TextMessage, VideoMessage, DocumentMessage } from './Message';
declare type Message = AudioMessage | ContactMessage | ImageMessage | LocationMessage | TextMessage | VideoMessage | DocumentMessage;
declare const isMessage: {
    isAudioMessageValidate: (x: unknown) => x is AudioMessage;
    isContactMessageValidate: (x: unknown) => x is ContactMessage;
    isImageMessageValidate: (x: unknown) => x is ImageMessage;
    isLocationMessageValidate: (x: unknown) => x is LocationMessage;
    isTextMessageValidate: (x: unknown) => x is TextMessage;
    isVideoMessageValidate: (x: unknown) => x is VideoMessage;
    isDocumentMessageValidate: (x: unknown) => x is VideoMessage;
};
declare type ConnAdm = Connect | Connectionstate | Disconnect | Signupconnection;
declare type ConnectionSwitch = Connect | Disconnect | Connectionstate;
declare const isConnAdm: {
    isConnect: (x: unknown) => x is Connect;
    isConnectionstate: (x: unknown) => x is Connectionstate;
    isDisconnect: (x: unknown) => x is Disconnect;
    isSignupconnection: (x: unknown) => x is Signupconnection;
};
export { ConnAdm, ConnectionSwitch, Message, isConnAdm, isMessage, Connect, Connectionstate, Disconnect, Signupconnection, AudioMessage, ContactMessage, ImageMessage, LocationMessage, TextMessage, VideoMessage, DocumentMessage };
