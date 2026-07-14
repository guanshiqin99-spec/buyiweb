import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
export declare class SearchQueryDto extends PaginationQueryDto {
    keyword?: string;
    type?: 'dictionary' | 'phrase' | 'proverb' | 'song';
}
