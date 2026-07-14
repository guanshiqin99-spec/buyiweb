"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_cli_config_1 = require("../typeorm-cli.config");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
const proverb_entity_1 = require("../entities/proverb.entity");
async function seedMoreData() {
    await typeorm_cli_config_1.default.initialize();
    console.log('DataSource initialized for more data.');
    const dictRepo = typeorm_cli_config_1.default.getRepository(dictionary_entry_entity_1.DictionaryEntry);
    const phraseRepo = typeorm_cli_config_1.default.getRepository(phrase_entity_1.Phrase);
    const proverbRepo = typeorm_cli_config_1.default.getRepository(proverb_entity_1.Proverb);
    const dictData = [
        { buyiText: 'lumz', zhText: '风', zhSortKey: 'feng', enText: 'Wind', description: '自然现象', isPublished: true, sortOrder: 30 },
        { buyiText: 'fwngz', zhText: '云', zhSortKey: 'yun', enText: 'Cloud', description: '自然现象', isPublished: true, sortOrder: 31 },
        { buyiText: 'fwn', zhText: '雨', zhSortKey: 'yu', enText: 'Rain', description: '自然现象', isPublished: true, sortOrder: 32 },
        { buyiText: 'bin', zhText: '石头', zhSortKey: 'shi tou', enText: 'Stone', description: '自然', isPublished: true, sortOrder: 33 },
        { buyiText: 'ruz', zhText: '路', zhSortKey: 'lu', enText: 'Road', description: '交通', isPublished: true, sortOrder: 34 },
        { buyiText: 'nyaz', zhText: '草', zhSortKey: 'cao', enText: 'Grass', description: '植物', isPublished: true, sortOrder: 35 },
        { buyiText: 'hauz', zhText: '米', zhSortKey: 'mi', enText: 'Rice', description: '粮食', isPublished: true, sortOrder: 36 },
        { buyiText: 'noh', zhText: '肉', zhSortKey: 'rou', enText: 'Meat', description: '食物', isPublished: true, sortOrder: 37 },
        { buyiText: 'gyae', zhText: '盐', zhSortKey: 'yan', enText: 'Salt', description: '调料', isPublished: true, sortOrder: 38 },
        { buyiText: 'mwngz', zhText: '手', zhSortKey: 'shou', enText: 'Hand', description: '身体部位', isPublished: true, sortOrder: 39 },
        { buyiText: 'gyo', zhText: '头', zhSortKey: 'tou', enText: 'Head', description: '身体部位', isPublished: true, sortOrder: 40 },
        { buyiText: 'da', zhText: '眼睛', zhSortKey: 'yan jing', enText: 'Eye', description: '身体部位', isPublished: true, sortOrder: 41 },
        { buyiText: 'bae', zhText: '去', zhSortKey: 'qu', enText: 'Go', description: '动作', isPublished: true, sortOrder: 42 },
        { buyiText: 'ma', zhText: '来', zhSortKey: 'lai', enText: 'Come', description: '动作', isPublished: true, sortOrder: 43 },
        { buyiText: 'gan', zhText: '吃', zhSortKey: 'chi', enText: 'Eat', description: '动作', isPublished: true, sortOrder: 44 },
        { buyiText: 'ndwot', zhText: '喝', zhSortKey: 'he', enText: 'Drink', description: '动作', isPublished: true, sortOrder: 45 },
        { buyiText: 'nong', zhText: '睡', zhSortKey: 'shui', enText: 'Sleep', description: '动作', isPublished: true, sortOrder: 46 }
    ];
    for (const item of dictData) {
        const existing = await dictRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await dictRepo.save(dictRepo.create(item));
        }
    }
    console.log('More Dictionary data seeded.');
    const phraseData = [
        { buyiText: 'gop zai', zhText: '谢谢', zhSortKey: 'xie xie', enText: 'Thank you', description: '礼貌用语', isPublished: true, sortOrder: 10 },
        { buyiText: 'zai gen', zhText: '再见', zhSortKey: 'zai jian', enText: 'Goodbye', description: '告别', isPublished: true, sortOrder: 11 },
        { buyiText: 'gij lai ngenz', zhText: '多少钱', zhSortKey: 'duo shao qian', enText: 'How much', description: '购物', isPublished: true, sortOrder: 12 },
        { buyiText: 'gou mbou rox', zhText: '我不懂', zhSortKey: 'wo bu dong', enText: 'I do not understand', description: '交流', isPublished: true, sortOrder: 13 },
        { buyiText: 'gou bae ranz', zhText: '我回家', zhSortKey: 'wo hui jia', enText: 'I go home', description: '日常', isPublished: true, sortOrder: 14 }
    ];
    for (const item of phraseData) {
        const existing = await phraseRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await phraseRepo.save(phraseRepo.create(item));
        }
    }
    console.log('More Phrase data seeded.');
    const proverbData = [
        { buyiText: 'vunz laai rengz hung', zhText: '人多力量大', zhSortKey: 'ren duo li liang da', enText: 'Many hands make light work', description: '团结', isPublished: true, sortOrder: 2 },
        { buyiText: 'roog rwaek miz noh gan', zhText: '早起的鸟儿有虫吃', zhSortKey: 'zao qi de niao er you chong chi', enText: 'The early bird catches the worm', description: '勤奋', isPublished: true, sortOrder: 3 },
        { buyiText: 'nae raemx ndaem na', zhText: '引水插秧', zhSortKey: 'yin shui cha yang', enText: 'Lead water to plant rice', description: '顺应自然', isPublished: true, sortOrder: 4 }
    ];
    for (const item of proverbData) {
        const existing = await proverbRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await proverbRepo.save(proverbRepo.create(item));
        }
    }
    console.log('Proverb data seeded.');
    await typeorm_cli_config_1.default.destroy();
}
seedMoreData().catch(console.error);
//# sourceMappingURL=seed-more-data.js.map