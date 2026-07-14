"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_cli_config_1 = require("../typeorm-cli.config");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
async function seedData() {
    await typeorm_cli_config_1.default.initialize();
    console.log('DataSource initialized.');
    const dictRepo = typeorm_cli_config_1.default.getRepository(dictionary_entry_entity_1.DictionaryEntry);
    const phraseRepo = typeorm_cli_config_1.default.getRepository(phrase_entity_1.Phrase);
    const dictData = [
        { buyiText: 'na', zhText: '田', zhSortKey: 'tian', enText: 'Field', description: '农田', isPublished: true, sortOrder: 4 },
        { buyiText: 'bya', zhText: '山', zhSortKey: 'shan', enText: 'Mountain', description: '高山', isPublished: true, sortOrder: 5 },
        { buyiText: 're', zhText: '太阳', zhSortKey: 'tai yang', enText: 'Sun', description: '太阳', isPublished: true, sortOrder: 6 },
        { buyiText: 'ndwen', zhText: '月亮', zhSortKey: 'yue liang', enText: 'Moon', description: '月亮', isPublished: true, sortOrder: 7 },
        { buyiText: 'nam', zhText: '水', zhSortKey: 'shui', enText: 'Water', description: '水', isPublished: true, sortOrder: 8 },
        { buyiText: 'fa', zhText: '火', zhSortKey: 'huo', enText: 'Fire', description: '火', isPublished: true, sortOrder: 9 },
        { buyiText: 'mok', zhText: '树', zhSortKey: 'shu', enText: 'Tree', description: '树木', isPublished: true, sortOrder: 10 },
        { buyiText: 'va', zhText: '花', zhSortKey: 'hua', enText: 'Flower', description: '花朵', isPublished: true, sortOrder: 11 },
        { buyiText: 'ran', zhText: '房子', zhSortKey: 'fang zi', enText: 'House', description: '房屋', isPublished: true, sortOrder: 12 },
        { buyiText: 'ngenz', zhText: '钱', zhSortKey: 'qian', enText: 'Money', description: '钱财/银子', isPublished: true, sortOrder: 13 },
        { buyiText: 'ma', zhText: '马', zhSortKey: 'ma', enText: 'Horse', description: '马', isPublished: true, sortOrder: 14 },
        { buyiText: 'gai', zhText: '鸡', zhSortKey: 'ji', enText: 'Chicken', description: '鸡', isPublished: true, sortOrder: 15 },
        { buyiText: 'moo', zhText: '猪', zhSortKey: 'zhu', enText: 'Pig', description: '猪', isPublished: true, sortOrder: 16 },
        { buyiText: 'be', zhText: '牛', zhSortKey: 'niu', enText: 'Cow', description: '牛', isPublished: true, sortOrder: 17 },
        { buyiText: 'duz', zhText: '狗', zhSortKey: 'gou', enText: 'Dog', description: '狗', isPublished: true, sortOrder: 18 },
        { buyiText: 'byo', zhText: '鱼', zhSortKey: 'yu', enText: 'Fish', description: '鱼', isPublished: true, sortOrder: 19 },
        { buyiText: 'roog', zhText: '鸟', zhSortKey: 'niao', enText: 'Bird', description: '鸟', isPublished: true, sortOrder: 20 },
        { buyiText: 'ga', zhText: '腿', zhSortKey: 'tui', enText: 'Leg', description: '腿/脚', isPublished: true, sortOrder: 21 },
        { buyiText: 'mue', zhText: '天', zhSortKey: 'tian', enText: 'Sky', description: '天空', isPublished: true, sortOrder: 22 },
        { buyiText: 'dieg', zhText: '地', zhSortKey: 'di', enText: 'Earth', description: '大地', isPublished: true, sortOrder: 23 },
        { buyiText: 'ban', zhText: '村庄', zhSortKey: 'cun zhuang', enText: 'Village', description: '村子', isPublished: true, sortOrder: 24 },
        { buyiText: 'gou', zhText: '我', zhSortKey: 'wo', enText: 'I/Me', description: '第一人称', isPublished: true, sortOrder: 25 },
        { buyiText: 'mouz', zhText: '你', zhSortKey: 'ni', enText: 'You', description: '第二人称', isPublished: true, sortOrder: 26 },
        { buyiText: 'te', zhText: '他', zhSortKey: 'ta', enText: 'He/She/It', description: '第三人称', isPublished: true, sortOrder: 27 },
    ];
    for (const item of dictData) {
        const existing = await dictRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await dictRepo.save(dictRepo.create(item));
        }
    }
    console.log('Dictionary data seeded.');
    const phraseData = [
        { buyiText: 'mang bai rux', zhText: '你去哪里', zhSortKey: 'ni qu na li', enText: 'Where are you going', description: '日常问路', isPublished: true, sortOrder: 3 },
        { buyiText: 'gan cau', zhText: '吃饭', zhSortKey: 'chi fan', enText: 'Eat meal', description: '日常用语', isPublished: true, sortOrder: 4 },
        { buyiText: 'nong ngau', zhText: '睡觉', zhSortKey: 'shui jiao', enText: 'Sleep', description: '起居', isPublished: true, sortOrder: 5 },
        { buyiText: 'yo xiong reih', zhText: '我喜欢你', zhSortKey: 'wo xi huan ni', enText: 'I like you', description: '表达情感', isPublished: true, sortOrder: 6 },
        { buyiText: 'noi diu gvai', zhText: '你真棒', zhSortKey: 'ni zhen bang', enText: 'You are great', description: '夸奖', isPublished: true, sortOrder: 7 },
    ];
    for (const item of phraseData) {
        const existing = await phraseRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await phraseRepo.save(phraseRepo.create(item));
        }
    }
    console.log('Phrase data seeded.');
    await typeorm_cli_config_1.default.destroy();
}
seedData().catch(console.error);
//# sourceMappingURL=seed-data.js.map