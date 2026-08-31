"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crud = void 0;
const common_1 = require("@nestjs/common");
const Crud = (operation) => (0, common_1.SetMetadata)('crudOperation', operation);
exports.Crud = Crud;
//# sourceMappingURL=crud.decorator.js.map