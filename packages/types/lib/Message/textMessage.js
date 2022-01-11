"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textMessageValidate = exports.textMessage = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkTextMessage = fluent_json_schema_1.default.object()
    .id('textMessage')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['textMessage']).required())
    .prop('wid', fluent_json_schema_1.default.string().required())
    .prop('from', fluent_json_schema_1.default.string().required())
    .prop('to', fluent_json_schema_1.default.string().required())
    .prop('timestamp', fluent_json_schema_1.default.string().required())
    .prop('msg', fluent_json_schema_1.default.string().required())
    .prop('author', fluent_json_schema_1.default.string())
    .prop('reply', fluent_json_schema_1.default.string())
    .prop('forward', fluent_json_schema_1.default.boolean());
const textMessage = mkTextMessage.valueOf();
exports.textMessage = textMessage;
const ajv = new ajv_1.default();
const textMessageValidate = ajv.compile(textMessage);
exports.textMessageValidate = textMessageValidate;
