"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactMessageValidate = exports.contactMessage = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkContactMessage = fluent_json_schema_1.default.object()
    .id('contactMessage')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['contactMessage']).required())
    .prop('wid', fluent_json_schema_1.default.string().required())
    .prop('from', fluent_json_schema_1.default.string().required())
    .prop('to', fluent_json_schema_1.default.string().required())
    .prop('timestamp', fluent_json_schema_1.default.string().required())
    .prop('vcard', fluent_json_schema_1.default.string().required())
    .prop('author', fluent_json_schema_1.default.string())
    .prop('reply', fluent_json_schema_1.default.string())
    .prop('forward', fluent_json_schema_1.default.boolean());
const contactMessage = mkContactMessage.valueOf();
exports.contactMessage = contactMessage;
const ajv = new ajv_1.default();
const contactMessageValidate = ajv.compile(contactMessage);
exports.contactMessageValidate = contactMessageValidate;
