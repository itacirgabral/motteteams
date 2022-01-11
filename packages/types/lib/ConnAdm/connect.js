"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectValidate = exports.connect = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkConnect = fluent_json_schema_1.default.object()
    .id('connect')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['connect']).required())
    .prop('hardid', fluent_json_schema_1.default.string().required())
    .prop('shard', fluent_json_schema_1.default.string().required())
    .prop('cacapa', fluent_json_schema_1.default.string().required())
    .prop('auth', fluent_json_schema_1.default.string());
const connect = mkConnect.valueOf();
exports.connect = connect;
const ajv = new ajv_1.default();
const connectValidate = ajv.compile(connect);
exports.connectValidate = connectValidate;
