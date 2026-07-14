"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_setting_entity_1 = require("../../entities/user-setting.entity");
const wechat_account_entity_1 = require("../../entities/wechat-account.entity");
const users_module_1 = require("../users/users.module");
const miniapp_settings_controller_1 = require("./miniapp-settings.controller");
const learning_reminder_service_1 = require("./learning-reminder.service");
let MiniappSettingsModule = class MiniappSettingsModule {
};
exports.MiniappSettingsModule = MiniappSettingsModule;
exports.MiniappSettingsModule = MiniappSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, typeorm_1.TypeOrmModule.forFeature([user_setting_entity_1.UserSetting, wechat_account_entity_1.WechatAccount])],
        controllers: [miniapp_settings_controller_1.MiniappSettingsController],
        providers: [learning_reminder_service_1.LearningReminderService],
    })
], MiniappSettingsModule);
//# sourceMappingURL=miniapp-settings.module.js.map