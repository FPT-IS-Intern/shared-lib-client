"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestService = void 0;
const http_1 = require("@angular/common/http");
const core_1 = require("@angular/core");
const rest_config_1 = require("./rest.config");
let RestService = class RestService {
    config;
    httpBackend;
    httpClient;
    constructor(config, httpClient, httpBackend) {
        this.config = config;
        this.httpClient = httpClient;
        this.httpBackend = new http_1.HttpClient(httpBackend);
    }
    requestWithoutInterceptor(method, path, body, params, headers = { 'Content-Type': 'application/json' }) {
        const httpParams = new http_1.HttpParams({
            fromObject: params || {}
        });
        return this.httpBackend.request(method, path, {
            headers: headers,
            body: body,
            params: httpParams,
        });
    }
    get(path, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithoutInterceptor('GET', path, undefined, params, headers);
    }
    post(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithoutInterceptor('POST', path, body, params, headers);
    }
    put(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithoutInterceptor('PUT', path, body, params, headers);
    }
    patch(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithoutInterceptor('PATCH', path, body, params, headers);
    }
    delete(path, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithoutInterceptor('DELETE', path, undefined, params, headers);
    }
    requestWithInterceptor(method, path, body, params, headers = { 'Content-Type': 'application/json' }) {
        const httpParams = new http_1.HttpParams({
            fromObject: params || {}
        });
        return this.httpClient.request(method, this.config.apiBaseUrl + path, {
            headers: headers,
            body: body,
            params: httpParams,
        });
    }
    getInternal(path, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithInterceptor('GET', path, undefined, params, headers);
    }
    postInternal(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithInterceptor('POST', path, body, params, headers);
    }
    putInternal(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithInterceptor('PUT', path, body, params, headers);
    }
    patchInternal(path, body, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithInterceptor('PATCH', path, body, params, headers);
    }
    deleteInternal(path, params, headers = { 'Content-Type': 'application/json' }) {
        return this.requestWithInterceptor('DELETE', path, undefined, params, headers);
    }
};
exports.RestService = RestService;
exports.RestService = RestService = __decorate([
    (0, core_1.Injectable)({ providedIn: 'root' }),
    __param(0, (0, core_1.Inject)(rest_config_1.REST_CONFIG)),
    __metadata("design:paramtypes", [Object, http_1.HttpClient,
        http_1.HttpBackend])
], RestService);
//# sourceMappingURL=rest.service.js.map