import { ContentType } from '../../../common/enums/content-type.enum';
export declare class CreateLearningRecordDto {
    contentType: ContentType;
    contentId: number;
    actionType: 'view' | 'play';
}
