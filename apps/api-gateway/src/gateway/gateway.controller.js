"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayController = void 0;
const common_1 = require("@nestjs/common");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
    router: {
        '/api/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        '/api/users': process.env.USER_SERVICE_URL || 'http://localhost:3002',
        '/api/quotes': process.env.QUOTE_SERVICE_URL || 'http://localhost:3003',
        '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
        '/api/beneficiary': process.env.BENEFICIARY_SERVICE_URL || 'http://localhost:3005',
        '/api/compliance': process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3006',
        '/api/document': process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3007',
        '/api/notification': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    },
    changeOrigin: true,
    pathRewrite: (path, req) => {
        // Keep the path as is, or rewrite if needed. Here we pass the full path down.
        return path;
    },
    onProxyReq: (proxyReq, req, res) => {
        if (req.headers['x-correlation-id']) {
            proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id']);
        }
        // Inject user info if authenticated
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.sub);
            proxyReq.setHeader('x-user-email', req.user.email);
        }
    },
});
let GatewayController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('Gateway'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('api')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _proxyAuth_decorators;
    let _proxyAll_decorators;
    var GatewayController = _classThis = class {
        // Example of a public route that does not require JWT (e.g., login/register)
        proxyAuth(req, res) {
            proxy(req, res, (err) => {
                if (err) {
                    res.status(500).send('Proxy Error');
                }
            });
        }
        // All other routes require JWT
        proxyAll(req, res) {
            proxy(req, res, (err) => {
                if (err) {
                    res.status(500).send('Proxy Error');
                }
            });
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
    __setFunctionName(_classThis, "GatewayController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _proxyAuth_decorators = [(0, common_1.All)('auth/*'), (0, swagger_1.ApiOperation)({ summary: 'Proxy to Auth Service (Public)' })];
        _proxyAll_decorators = [(0, common_1.All)('*'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiOperation)({ summary: 'Proxy to other services (Authenticated)' })];
        __esDecorate(_classThis, null, _proxyAuth_decorators, { kind: "method", name: "proxyAuth", static: false, private: false, access: { has: obj => "proxyAuth" in obj, get: obj => obj.proxyAuth }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _proxyAll_decorators, { kind: "method", name: "proxyAll", static: false, private: false, access: { has: obj => "proxyAll" in obj, get: obj => obj.proxyAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GatewayController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GatewayController = _classThis;
})();
exports.GatewayController = GatewayController;
//# sourceMappingURL=gateway.controller.js.map