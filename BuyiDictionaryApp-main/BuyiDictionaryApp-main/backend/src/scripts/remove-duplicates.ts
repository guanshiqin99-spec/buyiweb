import { DataSource } from 'typeorm';
import dataSource from '../typeorm-cli.config';
import { DictionaryEntry } from '../entities/dictionary-entry.entity';
import { Phrase } from '../entities/phrase.entity';
import { Proverb } from '../entities/proverb.entity';

async function removeDuplicates() {
  await dataSource.initialize();
  
  const dictRepo = dataSource.getRepository(DictionaryEntry);
  const phraseRepo = dataSource.getRepository(Phrase);
  const proverbRepo = dataSource.getRepository(Proverb);

  async function cleanupRepo(repo: any, name: string) {
    const allItems = await repo.find();
    const itemMap = new Map<string, any>();
    const idsToDelete: any[] = [];
    
    for (const item of allItems) {
      if (itemMap.has(item.buyiText)) {
        idsToDelete.push(item.id);
      } else {
        itemMap.set(item.buyiText, item);
      }
    }
    
    if (idsToDelete.length > 0) {
      await repo.delete(idsToDelete);
      console.log(`Deleted ${idsToDelete.length} duplicates from ${name}.`);
    } else {
      console.log(`No duplicates found in ${name}.`);
    }
  }

  await cleanupRepo(dictRepo, 'DictionaryEntry');
  await cleanupRepo(phraseRepo, 'Phrase');
  await cleanupRepo(proverbRepo, 'Proverb');

  await dataSource.destroy();
}

removeDuplicates().catch(console.error);
