"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupconnectionValidate = exports.signupconnection = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkSignupconnection = fluent_json_schema_1.default.object()
    .id('signupconnection')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['signupconnection']).required())
    .prop('hardid', fluent_json_schema_1.default.string().required())
    .prop('shard', fluent_json_schema_1.default.string().required())
    .prop('url', fluent_json_schema_1.default.string().required())
    .prop('mitochondria', fluent_json_schema_1.default.string().required())
    .prop('cacapa', fluent_json_schema_1.default.string().required());
const signupconnection = mkSignupconnection.valueOf();
exports.signupconnection = signupconnection;
const ajv = new ajv_1.default();
const signupconnectionValidate = ajv.compile(signupconnection);
exports.signupconnectionValidate = signupconnectionValidate;
