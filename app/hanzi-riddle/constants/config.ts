import { CharacterEntry, ClueType } from '../types/game';

export const MAX_ATTEMPTS = 5;
export const SCORE_PER_CLUE = 100;
export const HIGH_SCORE_KEY = 'hanzi-riddle-high-score';

export const CLUE_ORDER: ClueType[] = [
    'radical',
    'strokeCount',
    'meaningHint',
    'pinyinInitial',
    'fullPinyin',
];

export const CLUE_LABELS: Record<ClueType, string> = {
    radical: '偏旁部首',
    strokeCount: '笔画数',
    meaningHint: '含义提示',
    pinyinInitial: '拼音首字母',
    fullPinyin: '完整拼音',
};

export const CHARACTER_DB: CharacterEntry[] = [
    { character: '海', radical: '氵', strokeCount: 10, meaningHint: '广阔的水域', pinyinInitial: 'h', fullPinyin: 'hǎi' },
    { character: '河', radical: '氵', strokeCount: 8, meaningHint: '在地表流动的天然水道', pinyinInitial: 'h', fullPinyin: 'hé' },
    { character: '湖', radical: '氵', strokeCount: 12, meaningHint: '被陆地围绕的大片水域', pinyinInitial: 'h', fullPinyin: 'hú' },
    { character: '江', radical: '氵', strokeCount: 6, meaningHint: '大的河流', pinyinInitial: 'j', fullPinyin: 'jiāng' },
    { character: '波', radical: '氵', strokeCount: 8, meaningHint: '水面上起伏的纹路', pinyinInitial: 'b', fullPinyin: 'bō' },
    { character: '深', radical: '氵', strokeCount: 11, meaningHint: '从表面到底部距离大', pinyinInitial: 's', fullPinyin: 'shēn' },
    { character: '清', radical: '氵', strokeCount: 11, meaningHint: '水纯净没有杂质', pinyinInitial: 'q', fullPinyin: 'qīng' },
    { character: '洋', radical: '氵', strokeCount: 9, meaningHint: '比海更大的水域', pinyinInitial: 'y', fullPinyin: 'yáng' },
    { character: '洗', radical: '氵', strokeCount: 9, meaningHint: '用水去掉污垢', pinyinInitial: 'x', fullPinyin: 'xǐ' },
    { character: '泪', radical: '氵', strokeCount: 8, meaningHint: '眼睛流出的液体', pinyinInitial: 'l', fullPinyin: 'lèi' },
    { character: '花', radical: '艹', strokeCount: 7, meaningHint: '植物的繁殖器官，色彩鲜艳', pinyinInitial: 'h', fullPinyin: 'huā' },
    { character: '草', radical: '艹', strokeCount: 9, meaningHint: '矮小的绿色植物', pinyinInitial: 'c', fullPinyin: 'cǎo' },
    { character: '茶', radical: '艹', strokeCount: 9, meaningHint: '一种可以泡水的植物叶子', pinyinInitial: 'c', fullPinyin: 'chá' },
    { character: '药', radical: '艹', strokeCount: 9, meaningHint: '用来治病的物质', pinyinInitial: 'y', fullPinyin: 'yào' },
    { character: '菜', radical: '艹', strokeCount: 11, meaningHint: '可以吃的植物', pinyinInitial: 'c', fullPinyin: 'cài' },
    { character: '树', radical: '木', strokeCount: 9, meaningHint: '有树干和树冠的高大植物', pinyinInitial: 's', fullPinyin: 'shù' },
    { character: '林', radical: '木', strokeCount: 8, meaningHint: '成片的树木', pinyinInitial: 'l', fullPinyin: 'lín' },
    { character: '森', radical: '木', strokeCount: 12, meaningHint: '比林更茂密的树木聚集地', pinyinInitial: 's', fullPinyin: 'sēn' },
    { character: '桥', radical: '木', strokeCount: 10, meaningHint: '架在水面或空中供通行的建筑', pinyinInitial: 'q', fullPinyin: 'qiáo' },
    { character: '明', radical: '日', strokeCount: 8, meaningHint: '光亮，与暗相对', pinyinInitial: 'm', fullPinyin: 'míng' },
    { character: '星', radical: '日', strokeCount: 9, meaningHint: '夜空中闪烁的光点', pinyinInitial: 'x', fullPinyin: 'xīng' },
    { character: '晚', radical: '日', strokeCount: 11, meaningHint: '太阳落山以后的时间', pinyinInitial: 'w', fullPinyin: 'wǎn' },
    { character: '暖', radical: '日', strokeCount: 13, meaningHint: '温度适中，不冷', pinyinInitial: 'n', fullPinyin: 'nuǎn' },
    { character: '想', radical: '心', strokeCount: 13, meaningHint: '思考，思念', pinyinInitial: 'x', fullPinyin: 'xiǎng' },
    { character: '思', radical: '心', strokeCount: 9, meaningHint: '动脑筋考虑', pinyinInitial: 's', fullPinyin: 'sī' },
    { character: '情', radical: '忄', strokeCount: 11, meaningHint: '内心的感受和情绪', pinyinInitial: 'q', fullPinyin: 'qíng' },
    { character: '怕', radical: '忄', strokeCount: 8, meaningHint: '害怕，恐惧', pinyinInitial: 'p', fullPinyin: 'pà' },
    { character: '忙', radical: '忄', strokeCount: 6, meaningHint: '事情多，没有空闲', pinyinInitial: 'm', fullPinyin: 'máng' },
    { character: '红', radical: '纟', strokeCount: 6, meaningHint: '像鲜血一样的颜色', pinyinInitial: 'h', fullPinyin: 'hóng' },
    { character: '线', radical: '纟', strokeCount: 8, meaningHint: '细长的丝状物', pinyinInitial: 'x', fullPinyin: 'xiàn' },
    { character: '纸', radical: '纟', strokeCount: 7, meaningHint: '用来写字和印刷的薄片材料', pinyinInitial: 'z', fullPinyin: 'zhǐ' },
    { character: '银', radical: '钅', strokeCount: 11, meaningHint: '白色的贵金属', pinyinInitial: 'y', fullPinyin: 'yín' },
    { character: '铁', radical: '钅', strokeCount: 10, meaningHint: '坚硬有磁性的常见金属', pinyinInitial: 't', fullPinyin: 'tiě' },
    { character: '钢', radical: '钅', strokeCount: 9, meaningHint: '铁和碳的合金，非常坚硬', pinyinInitial: 'g', fullPinyin: 'gāng' },
    { character: '说', radical: '讠', strokeCount: 9, meaningHint: '用语言表达意思', pinyinInitial: 's', fullPinyin: 'shuō' },
    { character: '话', radical: '讠', strokeCount: 8, meaningHint: '说出来的语言内容', pinyinInitial: 'h', fullPinyin: 'huà' },
    { character: '诗', radical: '讠', strokeCount: 8, meaningHint: '有韵律的文学体裁', pinyinInitial: 's', fullPinyin: 'shī' },
    { character: '语', radical: '讠', strokeCount: 9, meaningHint: '人类交流使用的声音系统', pinyinInitial: 'y', fullPinyin: 'yǔ' },
    { character: '谢', radical: '讠', strokeCount: 12, meaningHint: '表示感激', pinyinInitial: 'x', fullPinyin: 'xiè' },
    { character: '跑', radical: '足', strokeCount: 12, meaningHint: '快速地用脚移动', pinyinInitial: 'p', fullPinyin: 'pǎo' },
    { character: '跳', radical: '足', strokeCount: 13, meaningHint: '两脚离地向上或向前', pinyinInitial: 't', fullPinyin: 'tiào' },
    { character: '路', radical: '足', strokeCount: 13, meaningHint: '供行走的通道', pinyinInitial: 'l', fullPinyin: 'lù' },
    { character: '雪', radical: '雨', strokeCount: 11, meaningHint: '天空中飘落的白色冰晶', pinyinInitial: 'x', fullPinyin: 'xuě' },
    { character: '雷', radical: '雨', strokeCount: 13, meaningHint: '云中放电时发出的响声', pinyinInitial: 'l', fullPinyin: 'léi' },
    { character: '露', radical: '雨', strokeCount: 21, meaningHint: '清晨凝结在物体上的水珠', pinyinInitial: 'l', fullPinyin: 'lù' },
    { character: '看', radical: '目', strokeCount: 9, meaningHint: '用眼睛观察', pinyinInitial: 'k', fullPinyin: 'kàn' },
    { character: '眼', radical: '目', strokeCount: 11, meaningHint: '用来看东西的器官', pinyinInitial: 'y', fullPinyin: 'yǎn' },
    { character: '睡', radical: '目', strokeCount: 13, meaningHint: '闭上眼睛休息，失去知觉', pinyinInitial: 's', fullPinyin: 'shuì' },
    { character: '听', radical: '口', strokeCount: 7, meaningHint: '用耳朵感知声音', pinyinInitial: 't', fullPinyin: 'tīng' },
    { character: '吃', radical: '口', strokeCount: 6, meaningHint: '把食物放入口中咀嚼咽下', pinyinInitial: 'c', fullPinyin: 'chī' },
    { character: '唱', radical: '口', strokeCount: 11, meaningHint: '发出有旋律的声音', pinyinInitial: 'c', fullPinyin: 'chàng' },
    { character: '叫', radical: '口', strokeCount: 5, meaningHint: '大声发出声音', pinyinInitial: 'j', fullPinyin: 'jiào' },
    { character: '笑', radical: '竹', strokeCount: 10, meaningHint: '高兴时脸上露出的表情', pinyinInitial: 'x', fullPinyin: 'xiào' },
    { character: '笔', radical: '竹', strokeCount: 10, meaningHint: '用来写字或画图的工具', pinyinInitial: 'b', fullPinyin: 'bǐ' },
    { character: '篮', radical: '竹', strokeCount: 16, meaningHint: '用竹篾编成的盛物器具', pinyinInitial: 'l', fullPinyin: 'lán' },
    { character: '地', radical: '土', strokeCount: 6, meaningHint: '人类居住的星球表面', pinyinInitial: 'd', fullPinyin: 'dì' },
    { character: '城', radical: '土', strokeCount: 9, meaningHint: '有城墙围绕的大型聚居地', pinyinInitial: 'c', fullPinyin: 'chéng' },
    { character: '墙', radical: '土', strokeCount: 14, meaningHint: '用砖石等砌成的隔断结构', pinyinInitial: 'q', fullPinyin: 'qiáng' },
    { character: '春', radical: '日', strokeCount: 9, meaningHint: '一年中万物复苏的季节', pinyinInitial: 'c', fullPinyin: 'chūn' },
    { character: '秋', radical: '禾', strokeCount: 9, meaningHint: '一年中收获的季节', pinyinInitial: 'q', fullPinyin: 'qiū' },
    { character: '猫', radical: '犭', strokeCount: 11, meaningHint: '会捉老鼠的家养小动物', pinyinInitial: 'm', fullPinyin: 'māo' },
    { character: '狗', radical: '犭', strokeCount: 8, meaningHint: '人类最忠诚的动物朋友', pinyinInitial: 'g', fullPinyin: 'gǒu' },
    { character: '狮', radical: '犭', strokeCount: 9, meaningHint: '被称为百兽之王的大型猫科动物', pinyinInitial: 's', fullPinyin: 'shī' },
    { character: '打', radical: '扌', strokeCount: 5, meaningHint: '用手或工具击', pinyinInitial: 'd', fullPinyin: 'dǎ' },
    { character: '拍', radical: '扌', strokeCount: 8, meaningHint: '用手掌轻击', pinyinInitial: 'p', fullPinyin: 'pāi' },
    { character: '拉', radical: '扌', strokeCount: 8, meaningHint: '用力使物体向自己方向移动', pinyinInitial: 'l', fullPinyin: 'lā' },
];

const DISTRACTORS = [
    '的', '一', '是', '不', '了', '我', '在', '有', '他', '这',
    '中', '上', '下', '来', '去', '做', '着', '过', '和', '也',
    '那', '要', '会', '就', '把', '让', '给', '被', '从', '向',
    '很', '都', '能', '此', '些', '没', '而', '以', '但', '又',
];

function buildKeyboard(): string[][] {
    const dbChars = CHARACTER_DB.map((e) => e.character);
    const dbSet = new Set(dbChars);
    const filler = DISTRACTORS.filter((c) => !dbSet.has(c));
    const all = [...dbChars];
    let fi = 0;
    while (all.length % 10 !== 0 && fi < filler.length) {
        all.push(filler[fi++]);
    }
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    const rows: string[][] = [];
    for (let i = 0; i < all.length; i += 10) {
        rows.push(all.slice(i, i + 10));
    }
    return rows;
}

export const KEYBOARD_ROWS: string[][] = buildKeyboard();
