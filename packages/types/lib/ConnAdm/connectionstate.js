"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionstateValidate = exports.connectionstate = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkConnectionstate = fluent_json_schema_1.default.object()
    .id('connectionstate')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['connectionstate']).required())
    .prop('hardid', fluent_json_schema_1.default.string().required())
    .prop('shard', fluent_json_schema_1.default.string().required())
    .prop('cacapa', fluent_json_schema_1.default.string().required());
const connectionstate = mkConnectionstate.valueOf();
exports.connectionstate = connectionstate;
const ajv = new ajv_1.default();
const connectionstateValidate = ajv.compile(connectionstate);
exports.connectionstateValidate = connectionstateValidate;
