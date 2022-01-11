"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationMessageValidate = exports.locationMessage = void 0;
const fluent_json_schema_1 = __importDefault(require("fluent-json-schema"));
const ajv_1 = __importDefault(require("ajv"));
const mkLocationMessage = fluent_json_schema_1.default.object()
    .id('locationMessage')
    .additionalProperties(false)
    .prop('type', fluent_json_schema_1.default.enum(['locationMessage']).required())
    .prop('wid', fluent_json_schema_1.default.string().required())
    .prop('from', fluent_json_schema_1.default.string().required())
    .prop('to', fluent_json_schema_1.default.string().required())
    .prop('timestamp', fluent_json_schema_1.default.string().required())
    .prop('description', fluent_json_schema_1.default.string().required())
    .prop('latitude', fluent_json_schema_1.default.string().required())
    .prop('longitude', fluent_json_schema_1.default.string().required())
    .prop('author', fluent_json_schema_1.default.string())
    .prop('reply', fluent_json_schema_1.default.string())
    .prop('forward', fluent_json_schema_1.default.boolean());
const locationMessage = mkLocationMessage.valueOf();
exports.locationMessage = locationMessage;
const ajv = new ajv_1.default();
const locationMessageValidate = ajv.compile(locationMessage);
exports.locationMessageValidate = locationMessageValidate;
