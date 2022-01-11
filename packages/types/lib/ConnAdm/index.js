"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSignupconnection = exports.isDisconnect = exports.isConnectionstate = exports.isConnect = void 0;
const connect_1 = require("./connect");
const connectionstate_1 = require("./connectionstate");
const disconnect_1 = require("./disconnect");
const signupconnection_1 = require("./signupconnection");
const isConnect = function isConnect(x) {
    return !!(0, connect_1.connectValidate)(x);
};
exports.isConnect = isConnect;
const isConnectionstate = function isConnectionstate(x) {
    return !!(0, connectionstate_1.connectionstateValidate)(x);
};
exports.isConnectionstate = isConnectionstate;
const isDisconnect = function isDisconnect(x) {
    return !!(0, disconnect_1.disconnectValidate)(x);
};
exports.isDisconnect = isDisconnect;
const isSignupconnection = function isSignupconnection(x) {
    return !!(0, signupconnection_1.signupconnectionValidate)(x);
};
exports.isSignupconnection = isSignupconnection;
