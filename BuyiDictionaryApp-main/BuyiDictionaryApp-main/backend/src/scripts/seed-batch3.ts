import { DataSource } from 'typeorm';
import dataSource from '../typeorm-cli.config';
import { DictionaryEntry } from '../entities/dictionary-entry.entity';
import { Phrase } from '../entities/phrase.entity';
import { Proverb } from '../entities/proverb.entity';


async function seedBatch3Data() {
  await dataSource.initialize();
  console.log('DataSource initialized for batch 3.');

  const dictRepo = dataSource.getRepository(DictionaryEntry);
  const phraseRepo = dataSource.getRepository(Phrase);
  const proverbRepo = dataSource.getRepository(Proverb);

  const dictData = [
    { buyiText: 'ndanl', zhText: '个（量词）', zhSortKey: 'ge', enText: '(measure word for objects)', description: '量词', isPublished: true, sortOrder: 100 },
    { buyiText: 'soongl', zhText: '二', zhSortKey: 'er', enText: 'two', description: '数字', isPublished: true, sortOrder: 101 },
    { buyiText: 'saaml', zhText: '三', zhSortKey: 'san', enText: 'three', description: '数字', isPublished: true, sortOrder: 102 },
    { buyiText: 'sis', zhText: '四', zhSortKey: 'si', enText: 'four', description: '数字', isPublished: true, sortOrder: 103 },
    { buyiText: 'hac', zhText: '五', zhSortKey: 'wu', enText: 'five', description: '数字', isPublished: true, sortOrder: 104 },
    { buyiText: 'rogt', zhText: '六', zhSortKey: 'liu', enText: 'six', description: '数字', isPublished: true, sortOrder: 105 },
    { buyiText: 'xadt', zhText: '七', zhSortKey: 'qi', enText: 'seven', description: '数字', isPublished: true, sortOrder: 106 },
    { buyiText: 'beedt', zhText: '八', zhSortKey: 'ba', enText: 'eight', description: '数字', isPublished: true, sortOrder: 107 },
    { buyiText: 'guc', zhText: '九', zhSortKey: 'jiu', enText: 'nine', description: '数字', isPublished: true, sortOrder: 108 },
    { buyiText: 'xib', zhText: '十', zhSortKey: 'shi', enText: 'ten', description: '数字', isPublished: true, sortOrder: 109 },
    { buyiText: 'haaul', zhText: '白', zhSortKey: 'bai', enText: 'white', description: '颜色', isPublished: true, sortOrder: 110 },
    { buyiText: 'hingz', zhText: '红', zhSortKey: 'hong', enText: 'red', description: '颜色', isPublished: true, sortOrder: 111 },
    { buyiText: 'ndaamz', zhText: '黑', zhSortKey: 'hei', enText: 'black', description: '颜色', isPublished: true, sortOrder: 112 },
    { buyiText: 'heenc', zhText: '黄', zhSortKey: 'huang', enText: 'yellow', description: '颜色', isPublished: true, sortOrder: 113 },
    { buyiText: 'log', zhText: '绿', zhSortKey: 'lv', enText: 'green', description: '颜色', isPublished: true, sortOrder: 114 },
    { buyiText: 'ngonz', zhText: '天/日', zhSortKey: 'tian', enText: 'day', description: '时间', isPublished: true, sortOrder: 115 },
    { buyiText: 'ndianl', zhText: '月', zhSortKey: 'yue', enText: 'month', description: '时间', isPublished: true, sortOrder: 116 },
    { buyiText: 'bil', zhText: '年', zhSortKey: 'nian', enText: 'year', description: '时间', isPublished: true, sortOrder: 117 },
    { buyiText: 'maux', zhText: '早上', zhSortKey: 'zao shang', enText: 'morning', description: '时间', isPublished: true, sortOrder: 118 },
    { buyiText: 'ringz', zhText: '中午', zhSortKey: 'zhong wu', enText: 'noon', description: '时间', isPublished: true, sortOrder: 119 },
    { buyiText: 'fiz', zhText: '醉', zhSortKey: 'zui', enText: 'drunk', description: '状态', isPublished: true, sortOrder: 120 },
    { buyiText: 'ndil', zhText: '好', zhSortKey: 'hao', enText: 'good', description: '状态', isPublished: true, sortOrder: 121 },
    { buyiText: 'qyas', zhText: '坏', zhSortKey: 'huai', enText: 'bad', description: '状态', isPublished: true, sortOrder: 122 },
    { buyiText: 'laaux', zhText: '大', zhSortKey: 'da', enText: 'big', description: '状态', isPublished: true, sortOrder: 123 },
    { buyiText: 'nees', zhText: '小', zhSortKey: 'xiao', enText: 'small', description: '状态', isPublished: true, sortOrder: 124 },
    { buyiText: 'raez', zhText: '长', zhSortKey: 'chang', enText: 'long', description: '状态', isPublished: true, sortOrder: 125 },
    { buyiText: 'dinl', zhText: '短', zhSortKey: 'duan', enText: 'short', description: '状态', isPublished: true, sortOrder: 126 },
    { buyiText: 'genl', zhText: '吃', zhSortKey: 'chi', enText: 'to eat', description: '动作', isPublished: true, sortOrder: 127 },
    { buyiText: 'bail', zhText: '去', zhSortKey: 'qu', enText: 'to go', description: '动作', isPublished: true, sortOrder: 128 },
    { buyiText: 'mal', zhText: '来', zhSortKey: 'lai', enText: 'to come', description: '动作', isPublished: true, sortOrder: 129 }
  ];

  for (const item of dictData) {
    const existing = await dictRepo.findOneBy({ buyiText: item.buyiText });
    if (!existing) {
      await dictRepo.save(dictRepo.create(item));
    }
  }
  console.log('Batch 3 Dictionary data seeded.');

  const phraseData = [
    { buyiText: 'Gul ma.', zhText: '我回来了。', zhSortKey: 'wo hui lai le', enText: 'I\'m back.', description: '日常', isPublished: true, sortOrder: 40 },
    { buyiText: 'Mengz genlhaux fih?', zhText: '你吃饭了吗？', zhSortKey: 'ni chi fan le ma', enText: 'Have you eaten yet?', description: '问候', isPublished: true, sortOrder: 41 },
    { buyiText: 'Genl ims bai.', zhText: '吃饱了。', zhSortKey: 'chi bao le', enText: 'I\'m full.', description: '就餐', isPublished: true, sortOrder: 42 },
    { buyiText: 'Miz ndil genl.', zhText: '不好吃。', zhSortKey: 'bu hao chi', enText: 'It doesn\'t taste good.', description: '评价', isPublished: true, sortOrder: 43 },
    { buyiText: 'Mengz wail geacmaz?', zhText: '你贵姓？', zhSortKey: 'ni gui xing', enText: 'What is your surname?', description: '寒暄', isPublished: true, sortOrder: 44 },
    { buyiText: 'Gul wail Waangz.', zhText: '我姓王。', zhSortKey: 'wo xing wang', enText: 'My surname is Wang.', description: '介绍', isPublished: true, sortOrder: 45 },
    { buyiText: 'Gul deengl wenz xisheengl.', zhText: '我是册亨人。', zhSortKey: 'wo shi ce heng ren', enText: 'I am from Ceheng.', description: '介绍', isPublished: true, sortOrder: 46 },
    { buyiText: 'Raanz gul qyus xeehlauz.', zhText: '我家住者楼。', zhSortKey: 'wo jia zhu zhe lou', enText: 'My home is in Zhelou.', description: '介绍', isPublished: true, sortOrder: 47 },
    { buyiText: 'Mengz lix ganc miz?', zhText: '你身体好吗？', zhSortKey: 'ni shen ti hao ma', enText: 'Are you feeling well?', description: '关心', isPublished: true, sortOrder: 48 },
    { buyiText: 'Naaih naaih mal.', zhText: '慢慢来。', zhSortKey: 'man man lai', enText: 'Take it easy.', description: '安慰', isPublished: true, sortOrder: 49 }
  ];

  for (const item of phraseData) {
    const existing = await phraseRepo.findOneBy({ buyiText: item.buyiText });
    if (!existing) {
      await phraseRepo.save(phraseRepo.create(item));
    }
  }
  console.log('Batch 3 Phrase data seeded.');

  const proverbData = [
    { buyiText: 'Bya sang miz laaul fwn laaux.', zhText: '山高不怕雨大。', zhSortKey: 'shan gao bu pa yu da', enText: 'A high mountain does not fear heavy rain. (Be steadfast in the face of difficulty.)', description: '坚韧', isPublished: true, sortOrder: 10 },
    { buyiText: 'Rog mbin gvaq jaangl mbwn, duezbyal ndaix gvaq dah laaux.', zhText: '鸟飞过天空，鱼游过大河。', zhSortKey: 'niao fei guo tian kong', enText: 'Birds fly through the sky, fish swim across great rivers. (Everyone has their own strengths.)', description: '各有所长', isPublished: true, sortOrder: 11 },
    { buyiText: 'Miz lix laaul naanz, danh aul reengz.', zhText: '不怕难，只怕懒。', zhSortKey: 'bu pa nan', enText: 'Don\'t fear difficulty, only fear laziness. (Diligence overcomes hardship.)', description: '勤奋', isPublished: true, sortOrder: 12 },
    { buyiText: 'Gueh wenz aul soh, gueh hoongl aul ganx.', zhText: '做人要直，做工要勤。', zhSortKey: 'zuo ren yao zhi', enText: 'Be honest as a person, be diligent in work.', description: '诚实勤奋', isPublished: true, sortOrder: 13 },
    { buyiText: 'Aul ramx soongl dah, gah nyangh soongl ronl.', zhText: '取水两条河，自酿两坛酒。', zhSortKey: 'qu shui liang tiao he', enText: 'Draw water from two rivers, brew two jars of wine. (Diversify your resources to be self-sufficient.)', description: '自给自足', isPublished: true, sortOrder: 14 }
  ];

  for (const item of proverbData) {
    const existing = await proverbRepo.findOneBy({ buyiText: item.buyiText });
    if (!existing) {
      await proverbRepo.save(proverbRepo.create(item));
    }
  }
  console.log('Batch 3 Proverb data seeded.');

  await dataSource.destroy();
}

seedBatch3Data().catch(console.error);