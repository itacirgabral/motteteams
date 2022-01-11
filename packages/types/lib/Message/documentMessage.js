"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentMessageValidate = exports.documentMessage = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkDocumentMessage = fluent_json_schema_1.default.object()
    .id('documentMessage')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['documentMessage']).required())
    .prop('wid', fluent_json_schema_1.default.string().required())
    .prop('from', fluent_json_schema_1.default.string().required())
    .prop('to', fluent_json_schema_1.default.string().required())
    .prop('timestamp', fluent_json_schema_1.default.string().required())
    .prop('mimetype', fluent_json_schema_1.default.string().required())
    .prop('bytes', fluent_json_schema_1.default.string().required())
    .prop('filename', fluent_json_schema_1.default.string().required())
    .prop('author', fluent_json_schema_1.default.string())
    .prop('reply', fluent_json_schema_1.default.string())
    .prop('forward', fluent_json_schema_1.default.boolean());
const documentMessage = mkDocumentMessage.valueOf();
exports.documentMessage = documentMessage;
const ajv = new ajv_1.default();
const documentMessageValidate = ajv.compile(documentMessage);
exports.documentMessageValidate = documentMessageValidate;
