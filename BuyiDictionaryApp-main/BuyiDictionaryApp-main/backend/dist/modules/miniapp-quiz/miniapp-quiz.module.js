"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappQuizModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quiz_attempt_entity_1 = require("../../entities/quiz-attempt.entity");
const miniapp_quiz_controller_1 = require("./miniapp-quiz.controller");
const miniapp_quiz_service_1 = require("./miniapp-quiz.service");
let MiniappQuizModule = class MiniappQuizModule {
};
exports.MiniappQuizModule = MiniappQuizModule;
exports.MiniappQuizModule = MiniappQuizModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quiz_attempt_entity_1.QuizAttempt])],
        controllers: [miniapp_quiz_controller_1.MiniappQuizController],
        providers: [miniapp_quiz_service_1.MiniappQuizService],
    })
], MiniappQuizModule);
//# sourceMappingURL=miniapp-quiz.module.js.map