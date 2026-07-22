// @deprecated 此脚本已废弃。
// 会友歌 / 分手调 / 鱼水情 已由根目录的 sync_songs_online.py 统一同步（含 duration 字段）。
// 请使用 sync_songs_online.py 同步全部 9 首歌曲数据，不要再运行本脚本。
import { DataSource } from 'typeorm';
import dataSource from '../typeorm-cli.config';
import { Song } from '../entities/song.entity';

async function seedMoreSongs() {
  console.warn('此脚本已废弃，请使用 sync_songs_online.py 统一同步歌曲数据');
  await dataSource.initialize();
  console.log('DataSource initialized for songs.');

  const songRepo = dataSource.getRepository(Song);

  const songs = [
    {
      title: '会友歌',
      artist: '布依民歌采集',
      buyiText: 'hui you ge',
      zhText: '会友歌',
      zhSortKey: 'hui you ge',
      enText: 'Friend Meeting Song',
      description: '布依族传统交友民歌，表达朋友相聚的喜悦之情',
      isPublished: true,
      sortOrder: 10,
      audioUrl: '/uploads/buyi_audio/huiyouge.MP3',
      lyrics: null,
    },
    {
      title: '分手调',
      artist: '布依民歌采集',
      buyiText: 'fen shou diao',
      zhText: '分手调',
      zhSortKey: 'fen shou diao',
      enText: 'Farewell Melody',
      description: '布依族离别时演唱的传统曲调，表达依依惜别之情',
      isPublished: true,
      sortOrder: 11,
      audioUrl: '/uploads/buyi_audio/fenshoudiao.MP3',
      lyrics: null,
    },
    {
      title: '鱼水情',
      artist: '布依民歌采集',
      buyiText: 'yu shui qing',
      zhText: '鱼水情',
      zhSortKey: 'yu shui qing',
      enText: 'Fish and Water Love',
      description: '布依族情歌，以鱼和水比喻深厚的感情',
      isPublished: true,
      sortOrder: 12,
      audioUrl: '/uploads/buyi_audio/yushuiqing.MP3',
      lyrics: null,
    },
  ];

  let count = 0;
  for (const item of songs) {
    const existing = await songRepo.findOneBy({ title: item.title });
    if (!existing) {
      await songRepo.save(songRepo.create(item));
      count++;
      console.log(`Added song: ${item.title}`);
    } else {
      console.log(`Song already exists: ${item.title}, updating audioUrl`);
      existing.audioUrl = item.audioUrl;
      existing.artist = item.artist;
      existing.description = item.description;
      await songRepo.save(existing);
    }
  }

  console.log(`\nTotal songs processed: ${songs.length}, added: ${count}`);

  const total = await songRepo.count();
  console.log(`Total songs in database: ${total}`);

  await dataSource.destroy();
}

seedMoreSongs().catch(console.error);
