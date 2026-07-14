"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_cli_config_1 = require("../typeorm-cli.config");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
const proverb_entity_1 = require("../entities/proverb.entity");
const dictRaw = `
- mbwn | 天、天空 | sky
- ndanl | 地、土地 | land
- naamh | 泥土 | soil
- fwn | 雨 | rain
- naengz | 风 | wind
- fuh | 云 | cloud
- ronghndianl | 月光 | moonlight
- daengngoenz | 阳光 | sunshine
- lac | 雷 | thunder
- byaj | 闪电 | lightning
- loengz | 露水 | dew
- nae | 霜 | frost
- nwix | 雪 | snow
- rongz | 虹 | rainbow
- ma | 狗 | dog
- meuz | 猫 | cat
- vaiz | 水牛 | water buffalo
- ciez | 黄牛 | cattle
- max | 马 | horse
- mou | 猪 | pig
- bit | 鸭 | duck
- gaeq | 鸡 | chicken
- yiuh | 鹰 | eagle
- roeg | 鸟 | bird
- bya | 鱼 | fish
- nengz | 蚊子 | mosquito
- rwi | 蜜蜂 | bee
- nengzndaem | 苍蝇 | fly
- duzwiz | 蛇 | snake
- guk | 老虎 | tiger
- faex | 树、木头 | tree/wood
- nyal | 草 | grass
- va | 花 | flower
- mak | 果子 | fruit
- makbug | 柚子 | pomelo
- makmoed | 桃子 | peach
- makmaenj | 李子 | plum
- maknganx | 龙眼 | longan
- makdaeq | 柿子 | persimmon
- oij | 甘蔗 | sugarcane
- haeux | 稻、米 | rice
- haeuxnaz | 水稻 | paddy rice
- haeuxyangz | 玉米 | corn
- legbyaek | 蔬菜 | vegetable
- byaekhau | 白菜 | cabbage
- byaekgat | 青菜 | greens
- lwgraz | 芝麻 | sesame
- duh | 豆子 | bean
- gyaeuj | 头 | head
- naj | 脸 | face
- da | 眼睛 | eye
- ndaeng | 鼻子 | nose
- bak | 嘴 | mouth
- rwz | 耳朵 | ear
- din | 脚 | foot
- fwngz | 手 | hand
- naeng | 皮肤 | skin
- ndok | 骨头 | bone
- lwed | 血 | blood
- sim | 心（脏） | heart (organ)
- dungx | 肚子 | belly
- hoz | 脖子 | neck
- boux | 人（量词） | person (classifier)
- wunz | 人、人类 | human
- boh | 父亲 | father
- meh | 母亲 | mother
- baeuq | 爷爷、外公 | grandfather
- yah | 奶奶、外婆 | grandmother
- lungz | 伯父、舅舅 | uncle (older)
- baj | 伯母、舅妈 | aunt (older)
- daeg | 弟（男） | younger brother
- nuengx | 弟、妹 | younger sibling
- lwg | 儿子、子女 | child
- lwgmbwk | 女儿 | daughter
- gwnz | 上、上面 | up/above
- laj | 下、下面 | down/below
- ndaw | 里、里面 | inside
- rog | 外、外面 | outside
- naj | 前 | front
- laeng | 后 | back
- swix | 左 | left
- gvaz | 右 | right
- ngoenzneix | 今天 | today
- ngoenzlwenz | 昨天 | yesterday
- ngoenzcog | 明天 | tomorrow
- ngoenzrawz | 后天 | day after tomorrow
- ngoenzbonz | 前天 | day before yesterday
- haemhneix | 今晚 | tonight
- haemhlwenz | 昨晚 | last night
- song | 两 | two
- sam | 三 | three
- seiq | 四 | four
- haj | 五 | five
- roek | 六 | six
- caet | 七 | seven
- bet | 八 | eight
- gouj | 九 | nine
- cib | 十 | ten
- bak | 百 | hundred
- cien | 千 | thousand
- fanh | 万 | ten thousand
- aen | 个（物） | (classifier for objects)
- duz | 只（动物） | (classifier for animals)
- go | 棵（植物） | (classifier for plants)
- boux | 位（人） | (classifier for people)
- ndei | 好 | good
- rwix | 坏、不好 | bad
- hung | 大 | big
- iq | 小 | small
- sang | 高 | tall/high
- daemq | 矮、低 | short/low
- raez | 长 | long
- dinj | 短 | short
- lai | 多 | many/much
- noix | 少 | few/little
- mbaeu | 轻 | light (weight)
- naek | 重 | heavy
- soh | 直、正直 | straight/honest
- goz | 弯、弯曲 | curved
- ndeu | 一 | one (numeral often after noun)
- gwn | 吃 | to eat
- ndoj | 喝 | to drink
- ninz | 睡 | to sleep
- byaij | 走 | to walk
- buet | 跑 | to run
- naengh | 坐 | to sit
- ndwn | 站 | to stand
- riu | 笑 | to laugh
- daej | 哭 | to cry
- caux | 造、制作 | to make/produce
- daez | 拿、带 | to take/carry
- soengq | 送 | to send/give
- nda | 背（孩子） | to carry on back
- dam | 织（布） | to weave
- ndaem | 种（植） | to plant
- yawj | 看 | to look/watch
- dingq | 听 | to listen
- ngeix | 想、思考 | to think
- naeuz | 说 | to say/speak
- ra | 找 | to look for
- ndaej | 得、得到 | to get
- hawj | 给 | to give
- daeuq | 回、返 | to return
- bae | 去 | to go
- daeuj |来 | to come
- lawz |哪、怎么 | which/how
- gijmaz |什么 | what
- bouxlawz |谁 | who
- geijlai |多少 | how many/how much
- gizlawz |哪里 | where
- baenzlawz |怎样 | how
- miz |有；不（否定） | have; not
- mbouj |不（否定） | not
- caeux |和、跟 | and/with
- ndi |不（否定） | not
- lij |还、尚 | still/yet
- caemh |也、一起 | also/together
`;
const phraseRaw = `
- Mwngz ndei! | 你好！ | Hello!
- Ngoenzneix ndei! | 今天好！ | Good day!
- Gwn haeux fih? | 吃饭了吗？ | Have you eaten?
- Gwn ndei ninz ndei. | 吃好睡好。 | Eat well and sleep well.
- Baez ndei byaij. | 一路走好。 | Have a safe journey.
- Docih mwngz. | 谢谢你。 | Thank you.
- Mbouj yungh cih. | 不客气。 | You're welcome.
- Ngoenzcog raen. | 明天见。 | See you tomorrow.
- Mwngz dwg boux gizlawz? | 你是哪里人？ | Where are you from?
- Gou dwg boux Gveicouh. | 我是贵州人。 | I am from Guizhou.
- Mwngz singq maz? | 你贵姓？ | What is your surname?
- Gou singq Lij. | 我姓李。 | My surname is Li.
- Mwngz miz geijlai bi? | 你多少岁？ | How old are you?
- Gou miz 20 bi. | 我20岁。 | I am 20 years old.
- Neix dwg gijmaz? | 这是什么？ | What is this?
- Haenx dwg saw Bouxyaej. | 那是布依文。 | That is Bouyei writing.
- Gou bae ranz. | 我回家。 | I'm going home.
- Mwngz bae gizlawz? | 你去哪里？ | Where are you going?
- Gou bae ndaw haw. | 我去街上（集市）。 | I'm going to the market.
- Cingj naengh. | 请坐。 | Please sit down.
- Cingj gwn caz. | 请喝茶。 | Please have some tea.
- Song aen haeuxgok neix baenz geijlai ngaenz? | 这两斤米多少钱？ | How much for these two jin of rice?
- Gou mbouj rox. | 我不懂。 | I don't understand.
- Mwngz gangj manh di. | 你说慢点。 | Speak slowly, please.
`;
const proverbRaw = `
- Raeuj sim raeuj dungx. | 热心热肠。 | Warm heart, warm belly. (Be warm-hearted.)
- Miz sim miz dungx. | 有心有肠。 | With heart and spirit. (To be sincere.)
- Baez daeuj hoj, baez bae ndei. | 来时苦，走时好。 | Come with hardship, leave with ease. (After a difficult start, things will get better.)
- Ndaej haeux mbouj lumz naz. | 得米不忘田。 | When you get rice, don’t forget the field. (Don't forget your roots.)
- Guh hong miz rengz, gwn haeux miz gwn. | 做工有力，吃饭有吃。 | Work hard, and you shall have food to eat. (No pain, no gain.)
- Raeuj nae raemx, raemx ndaej ndei. | 温泉暖水，水才好。 | Only warm spring water is good. (Kindness brings goodness.)
- Rengz lai vunz lai, ndaej gvaq dah. | 力气大人多，得过河。 | With great strength and many people, you can cross the river. (Unity is strength.)
- Bya sang miz raemx, dah laeg miz bya. | 山高有溪，河深有鱼。 | High mountains have streams, deep rivers have fish. (Everything has its own merit.)
- Ngoenz ndeu hong ndeu, sam bi baenz faexhung. | 一天一活，三年成大树。 | One day’s work, in three years grows a big tree. (Persistence yields great results.)
- Lwgsae mbouj lau fwnhung. | 螺蛳不怕大雨。 | Snails are not afraid of heavy rain. (Steadfast in any circumstance.)
- Aeu sim bae dingq, aeu dungx bae ngeix. | 用心去听，用肚去想。 | Listen with your heart, think with your gut. (Be attentive and thoughtful.)
- Miz nae miz fwn, miz rengz miz gwn. | 有霜有雨，有力有食。 | With frost and rain, with strength comes food. (Nature rewards hard work.)
- Vunz lai sim lai, baenz gijmaz cungj ndei. | 人多心多，做什么都好。 | Many people, many hearts – everything gets done well. (Collective wisdom.)
- Guh vunz mbouj lau hoj, lau mbouj guh hong. | 做人不吃苦，怕不干活。 | To be a person, don’t fear hardship, fear refusing to work.
- Ndei ndaej song bak, rwix ndaej song din. | 好不过嘴，坏不过脚。 | Good comes from the mouth, bad from the feet. (Think before you speak, and don't wander into trouble.)
`;
function parseRaw(text) {
    return text.trim().split('\n').map(line => line.trim()).filter(line => line.startsWith('-')).map(line => {
        const parts = line.substring(1).split('|').map(p => p.trim());
        return { buyi: parts[0], zh: parts[1], en: parts[2] };
    });
}
async function runSeed() {
    await typeorm_cli_config_1.default.initialize();
    const dictRepo = typeorm_cli_config_1.default.getRepository(dictionary_entry_entity_1.DictionaryEntry);
    const phraseRepo = typeorm_cli_config_1.default.getRepository(phrase_entity_1.Phrase);
    const proverbRepo = typeorm_cli_config_1.default.getRepository(proverb_entity_1.Proverb);
    const dictParsed = parseRaw(dictRaw);
    for (let i = 0; i < dictParsed.length; i++) {
        const item = dictParsed[i];
        const existing = await dictRepo.findOneBy({ buyiText: item.buyi });
        if (!existing) {
            await dictRepo.save(dictRepo.create({
                buyiText: item.buyi,
                zhText: item.zh,
                enText: item.en,
                zhSortKey: item.en.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10),
                description: '核心词汇',
                isPublished: true,
                sortOrder: 300 + i
            }));
        }
    }
    const phraseParsed = parseRaw(phraseRaw);
    for (let i = 0; i < phraseParsed.length; i++) {
        const item = phraseParsed[i];
        const existing = await phraseRepo.findOneBy({ buyiText: item.buyi });
        if (!existing) {
            await phraseRepo.save(phraseRepo.create({
                buyiText: item.buyi,
                zhText: item.zh,
                enText: item.en,
                zhSortKey: item.en.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10),
                description: '常用例句',
                isPublished: true,
                sortOrder: 200 + i
            }));
        }
    }
    const proverbParsed = parseRaw(proverbRaw);
    for (let i = 0; i < proverbParsed.length; i++) {
        const item = proverbParsed[i];
        const existing = await proverbRepo.findOneBy({ buyiText: item.buyi });
        if (!existing) {
            await proverbRepo.save(proverbRepo.create({
                buyiText: item.buyi,
                zhText: item.zh,
                enText: item.en,
                zhSortKey: item.en.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10),
                description: '民间智慧',
                isPublished: true,
                sortOrder: 200 + i
            }));
        }
    }
    await typeorm_cli_config_1.default.destroy();
    console.log('Successfully seeded ' + dictParsed.length + ' words, ' + phraseParsed.length + ' phrases, and ' + proverbParsed.length + ' proverbs.');
}
runSeed().catch(console.error);
//# sourceMappingURL=seed-batch4.js.map