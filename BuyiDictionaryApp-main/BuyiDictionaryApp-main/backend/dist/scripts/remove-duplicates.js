"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_cli_config_1 = require("../typeorm-cli.config");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
const proverb_entity_1 = require("../entities/proverb.entity");
async function removeDuplicates() {
    await typeorm_cli_config_1.default.initialize();
    const dictRepo = typeorm_cli_config_1.default.getRepository(dictionary_entry_entity_1.DictionaryEntry);
    const phraseRepo = typeorm_cli_config_1.default.getRepository(phrase_entity_1.Phrase);
    const proverbRepo = typeorm_cli_config_1.default.getRepository(proverb_entity_1.Proverb);
    async function cleanupRepo(repo, name) {
        const allItems = await repo.find();
        const itemMap = new Map();
        const idsToDelete = [];
        for (const item of allItems) {
            if (itemMap.has(item.buyiText)) {
                idsToDelete.push(item.id);
            }
            else {
                itemMap.set(item.buyiText, item);
            }
        }
        if (idsToDelete.length > 0) {
            await repo.delete(idsToDelete);
            console.log(`Deleted ${idsToDelete.length} duplicates from ${name}.`);
        }
        else {
            console.log(`No duplicates found in ${name}.`);
        }
    }
    await cleanupRepo(dictRepo, 'DictionaryEntry');
    await cleanupRepo(phraseRepo, 'Phrase');
    await cleanupRepo(proverbRepo, 'Proverb');
    await typeorm_cli_config_1.default.destroy();
}
removeDuplicates().catch(console.error);
//# sourceMappingURL=remove-duplicates.js.map