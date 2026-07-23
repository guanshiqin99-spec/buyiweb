import { UsersService } from '../users/users.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { LearningReminderService } from './learning-reminder.service';
export declare class MiniappSettingsController {
    private readonly usersService;
    private readonly learningReminderService;
    constructor(usersService: UsersService, learningReminderService: LearningReminderService);
    getReminderConfig(): {
        enabled: boolean;
        templateId: string;
    };
    private normalize;
    getSettings(user: {
        sub: number;
    }): Promise<{
        theme: string;
        fontSize: string;
        notifications: boolean;
        autoplay: boolean;
        language: string;
    }>;
    updateSettings(user: {
        sub: number;
    }, payload: UpdateSettingsDto): Promise<{
        theme: string;
        fontSize: string;
        notifications: boolean;
        autoplay: boolean;
        language: string;
    }>;
}
