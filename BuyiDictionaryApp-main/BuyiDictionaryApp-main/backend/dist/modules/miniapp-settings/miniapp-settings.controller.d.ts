import { UsersService } from '../users/users.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class MiniappSettingsController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getSettings(user: {
        sub: number;
    }): Promise<Record<string, string>>;
    updateSettings(user: {
        sub: number;
    }, payload: UpdateSettingsDto): Promise<Record<string, string>>;
}
