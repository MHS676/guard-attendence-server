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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudGuard = exports.CrudOperation = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
var CrudOperation;
(function (CrudOperation) {
    CrudOperation["CREATE"] = "CREATE";
    CrudOperation["READ"] = "READ";
    CrudOperation["UPDATE"] = "UPDATE";
    CrudOperation["DELETE"] = "DELETE";
})(CrudOperation || (exports.CrudOperation = CrudOperation = {}));
const CRUD_PERMISSIONS = {
    [client_1.Role.COORDINATOR]: new Set([
        CrudOperation.CREATE,
        CrudOperation.READ,
        CrudOperation.UPDATE,
        CrudOperation.DELETE,
    ]),
    [client_1.Role.CLIENT]: new Set([
        CrudOperation.READ,
    ]),
    [client_1.Role.SECURITY_IN_CHARGE]: new Set([
        CrudOperation.CREATE,
        CrudOperation.READ,
        CrudOperation.UPDATE,
        CrudOperation.DELETE,
    ]),
    [client_1.Role.SECURITY_SUPERVISOR]: new Set([
        CrudOperation.CREATE,
        CrudOperation.READ,
        CrudOperation.UPDATE,
        CrudOperation.DELETE,
    ]),
    [client_1.Role.SECURITY_GUARD]: new Set([
        CrudOperation.CREATE,
        CrudOperation.READ,
    ]),
};
let CrudGuard = class CrudGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredOperation = this.reflector.get('crudOperation', context.getHandler());
        if (!requiredOperation) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const userRole = user.role;
        const allowedOperations = CRUD_PERMISSIONS[userRole];
        if (!allowedOperations || !allowedOperations.has(requiredOperation)) {
            throw new common_1.ForbiddenException(`Role ${userRole} cannot perform ${requiredOperation} operation`);
        }
        return true;
    }
};
exports.CrudGuard = CrudGuard;
exports.CrudGuard = CrudGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], CrudGuard);
//# sourceMappingURL=crud.guard.js.map