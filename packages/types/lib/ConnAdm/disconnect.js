"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectValidate = exports.disconnect = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkDisconnect = fluent_json_schema_1.default.object()
    .id('disconnect')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['disconnect']).required())
    .prop('hardid', fluent_json_schema_1.default.string().required())
    .prop('shard', fluent_json_schema_1.default.string().required())
    .prop('cacapa', fluent_json_schema_1.default.string().required());
const disconnect = mkDisconnect.valueOf();
exports.disconnect = disconnect;
const ajv = new ajv_1.default();
const disconnectValidate = ajv.compile(disconnect);
exports.disconnectValidate = disconnectValidate;
