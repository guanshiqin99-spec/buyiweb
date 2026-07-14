import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { User } from '../../entities/user.entity';
export declare class AdminUsersController {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    list(query: PaginationQueryDto): Promise<{
        items: User[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
