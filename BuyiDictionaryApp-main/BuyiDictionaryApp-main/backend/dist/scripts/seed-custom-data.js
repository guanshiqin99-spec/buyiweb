"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_cli_config_1 = require("../typeorm-cli.config");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
const proverb_entity_1 = require("../entities/proverb.entity");
async function seedCustomData() {
    await typeorm_cli_config_1.default.initialize();
    console.log('DataSource initialized for custom data.');
    const dictRepo = typeorm_cli_config_1.default.getRepository(dictionary_entry_entity_1.DictionaryEntry);
    const phraseRepo = typeorm_cli_config_1.default.getRepository(phrase_entity_1.Phrase);
    const proverbRepo = typeorm_cli_config_1.default.getRepository(proverb_entity_1.Proverb);
    const dictData = [
        { buyiText: 'ndau', zhText: '星', zhSortKey: 'xing', enText: 'star', description: '自然', isPublished: true, sortOrder: 50 },
        { buyiText: 'ronghndianl', zhText: '月亮', zhSortKey: 'yue liang', enText: 'moon', description: '自然', isPublished: true, sortOrder: 51 },
        { buyiText: 'danglngonz', zhText: '太阳', zhSortKey: 'tai yang', enText: 'sun', description: '自然', isPublished: true, sortOrder: 52 },
        { buyiText: 'byal', zhText: '山', zhSortKey: 'shan', enText: 'mountain', description: '自然', isPublished: true, sortOrder: 53 },
        { buyiText: 'dah', zhText: '河', zhSortKey: 'he', enText: 'river', description: '自然', isPublished: true, sortOrder: 54 },
        { buyiText: 'bya', zhText: '鱼', zhSortKey: 'yu', enText: 'fish', description: '动物', isPublished: true, sortOrder: 55 },
        { buyiText: 'rog', zhText: '鸟', zhSortKey: 'niao', enText: 'bird', description: '动物', isPublished: true, sortOrder: 56 },
        { buyiText: 'duezmal', zhText: '狗', zhSortKey: 'gou', enText: 'dog', description: '动物', isPublished: true, sortOrder: 57 },
        { buyiText: 'gais', zhText: '鸡', zhSortKey: 'ji', enText: 'chicken', description: '动物', isPublished: true, sortOrder: 58 },
        { buyiText: 'bit', zhText: '鸭', zhSortKey: 'ya', enText: 'duck', description: '动物', isPublished: true, sortOrder: 59 },
        { buyiText: 'mou', zhText: '猪', zhSortKey: 'zhu', enText: 'pig', description: '动物', isPublished: true, sortOrder: 60 },
        { buyiText: 'fai', zhText: '树', zhSortKey: 'shu', enText: 'tree', description: '植物', isPublished: true, sortOrder: 61 },
        { buyiText: 'faix', zhText: '树木/木头', zhSortKey: 'shu mu', enText: 'wood', description: '植物', isPublished: true, sortOrder: 62 },
        { buyiText: 'ndaix', zhText: '得到', zhSortKey: 'de dao', enText: 'to get', description: '动作', isPublished: true, sortOrder: 63 },
        { buyiText: 'haec', zhText: '给', zhSortKey: 'gei', enText: 'to give', description: '动作', isPublished: true, sortOrder: 64 },
        { buyiText: 'riu', zhText: '笑', zhSortKey: 'xiao', enText: 'to laugh', description: '表情', isPublished: true, sortOrder: 65 },
        { buyiText: 'daic', zhText: '哭', zhSortKey: 'ku', enText: 'to cry', description: '表情', isPublished: true, sortOrder: 66 },
        { buyiText: 'daaus', zhText: '回；次', zhSortKey: 'hui', enText: 'to return; time', description: '动作/量词', isPublished: true, sortOrder: 67 },
        { buyiText: 'laez', zhText: '哪', zhSortKey: 'na', enText: 'which', description: '代词', isPublished: true, sortOrder: 68 },
        { buyiText: 'jiez', zhText: '处；地方', zhSortKey: 'chu', enText: 'place', description: '名词', isPublished: true, sortOrder: 69 }
    ];
    for (const item of dictData) {
        const existing = await dictRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await dictRepo.save(dictRepo.create(item));
        }
    }
    console.log('Custom Dictionary data seeded.');
    const phraseData = [
        { buyiText: 'Mengz ndil.', zhText: '你好。', zhSortKey: 'ni hao', enText: 'Hello.', description: '日常问候', isPublished: true, sortOrder: 20 },
        { buyiText: 'Dungx ies.', zhText: '谢谢。', zhSortKey: 'xie xie', enText: 'Thank you.', description: '礼貌', isPublished: true, sortOrder: 21 },
        { buyiText: 'Hannh bai.', zhText: '再见。', zhSortKey: 'zai jian', enText: 'Goodbye.', description: '告别', isPublished: true, sortOrder: 22 },
        { buyiText: 'Gul miz rox.', zhText: '我不懂。', zhSortKey: 'wo bu dong', enText: 'I don\'t understand.', description: '沟通', isPublished: true, sortOrder: 23 },
        { buyiText: 'Mengz bail jiezlaez?', zhText: '你去哪里？', zhSortKey: 'ni qu na li', enText: 'Where are you going?', description: '疑问', isPublished: true, sortOrder: 24 },
        { buyiText: 'Xac gul dic mal!', zhText: '等我一下！', zhSortKey: 'deng wo yi xia', enText: 'Wait for me a moment.', description: '请求', isPublished: true, sortOrder: 25 }
    ];
    for (const item of phraseData) {
        const existing = await phraseRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await phraseRepo.save(phraseRepo.create(item));
        }
    }
    console.log('Custom Phrase data seeded.');
    const proverbData = [
        { buyiText: 'Lix haux miz luanh gwnl, lix xeenz miz luanh yungh.', zhText: '有饭不乱吃，有钱不乱花。', zhSortKey: 'you fan bu luan chi', enText: 'When you have food, don\'t eat recklessly; when you have money, don\'t spend recklessly.', description: '节俭', isPublished: true, sortOrder: 5 },
        { buyiText: 'Ramx laaux ndaix nangh ruz.', zhText: '水大能载舟。', zhSortKey: 'shui da neng zai zhou', enText: 'When the water rises, boats can float.', description: '团结/借势', isPublished: true, sortOrder: 6 },
        { buyiText: 'Bail roh daaus hoongl, gueh wenz aul ndil.', zhText: '出门打工，做人要善。', zhSortKey: 'chu men da gong', enText: 'When going out to work, be a good person.', description: '劝善', isPublished: true, sortOrder: 7 }
    ];
    for (const item of proverbData) {
        const existing = await proverbRepo.findOneBy({ buyiText: item.buyiText });
        if (!existing) {
            await proverbRepo.save(proverbRepo.create(item));
        }
    }
    console.log('Custom Proverb data seeded.');
    await typeorm_cli_config_1.default.destroy();
}
seedCustomData().catch(console.error);
//# sourceMappingURL=seed-custom-data.js.map