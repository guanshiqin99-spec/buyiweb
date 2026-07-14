import { BaseEntity } from 'typeorm';
export declare abstract class BaseContentEntity extends BaseEntity {
    id: number;
    buyiText: string;
    zhText: string;
    enText: string | null;
    description: string | null;
    culturalNote: string | null;
    isPublished: boolean;
    sortOrder: number;
    zhSortKey: string;
    createdAt: Date;
    updatedAt: Date;
}
