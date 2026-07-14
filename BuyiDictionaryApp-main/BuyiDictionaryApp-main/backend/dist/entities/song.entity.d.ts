import { BaseContentEntity } from './base-content.entity';
export declare class Song extends BaseContentEntity {
    title: string;
    artist: string | null;
    coverUrl: string | null;
    audioUrl: string | null;
    lyrics: string | null;
    coverMediaId: number | null;
    audioMediaId: number | null;
}
