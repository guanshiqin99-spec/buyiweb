"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const app_config_1 = require("./config/app.config");
const database_config_1 = require("./config/database.config");
const config = (0, app_config_1.appConfig)();
exports.default = new typeorm_1.DataSource((0, database_config_1.buildTypeOrmOptions)(config));
//# sourceMappingURL=typeorm-cli.config.js.map