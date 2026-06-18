import type { Puzzle } from '../types/game';

const _ = false;
const X = true;

export const EASY_PUZZLES: Puzzle[] = [
    {
        id: 'easy-heart',
        name: '爱心',
        size: 5,
        solution: [
            [_, X, _, X, _],
            [X, X, X, X, X],
            [X, X, X, X, X],
            [_, X, X, X, _],
            [_, _, X, _, _],
        ],
    },
    {
        id: 'easy-arrow',
        name: '箭头',
        size: 5,
        solution: [
            [_, _, X, _, _],
            [_, X, X, X, _],
            [X, X, X, X, X],
            [_, _, X, _, _],
            [_, _, X, _, _],
        ],
    },
    {
        id: 'easy-cross',
        name: '十字',
        size: 5,
        solution: [
            [_, _, X, _, _],
            [_, _, X, _, _],
            [X, X, X, X, X],
            [_, _, X, _, _],
            [_, _, X, _, _],
        ],
    },
    {
        id: 'easy-diamond',
        name: '钻石',
        size: 5,
        solution: [
            [_, _, X, _, _],
            [_, X, _, X, _],
            [X, _, _, _, X],
            [_, X, _, X, _],
            [_, _, X, _, _],
        ],
    },
    {
        id: 'easy-smile',
        name: '笑脸',
        size: 5,
        solution: [
            [_, X, _, X, _],
            [_, X, _, X, _],
            [_, _, _, _, _],
            [X, _, _, _, X],
            [_, X, X, X, _],
        ],
    },
];

export const MEDIUM_PUZZLES: Puzzle[] = [
    {
        id: 'medium-house',
        name: '房子',
        size: 10,
        solution: [
            [_, _, _, _, X, X, _, _, _, _],
            [_, _, _, X, X, X, X, _, _, _],
            [_, _, X, X, X, X, X, X, _, _],
            [_, X, X, X, X, X, X, X, X, _],
            [X, X, X, X, X, X, X, X, X, X],
            [X, X, X, _, _, _, _, X, X, X],
            [X, X, X, _, _, _, _, X, X, X],
            [X, X, X, _, _, _, _, X, X, X],
            [X, X, X, _, _, _, _, X, X, X],
            [X, X, X, X, X, X, X, X, X, X],
        ],
    },
    {
        id: 'medium-star',
        name: '星星',
        size: 10,
        solution: [
            [_, _, _, _, X, X, _, _, _, _],
            [_, _, _, _, X, X, _, _, _, _],
            [_, _, _, X, X, X, X, _, _, _],
            [X, X, X, X, X, X, X, X, X, X],
            [_, X, X, X, X, X, X, X, X, _],
            [_, _, X, X, X, X, X, X, _, _],
            [_, _, X, X, _, _, X, X, _, _],
            [_, X, X, _, _, _, _, X, X, _],
            [_, X, X, _, _, _, _, X, X, _],
            [X, X, _, _, _, _, _, _, X, X],
        ],
    },
    {
        id: 'medium-cat',
        name: '猫咪',
        size: 10,
        solution: [
            [X, _, _, _, _, _, _, _, _, X],
            [X, X, _, _, _, _, _, _, X, X],
            [X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X],
            [X, _, X, X, _, _, X, X, _, X],
            [X, _, X, X, _, _, X, X, _, X],
            [X, X, X, X, X, X, X, X, X, X],
            [_, X, _, _, X, X, _, _, X, _],
            [_, _, X, X, _, _, X, X, _, _],
        ],
    },
    {
        id: 'medium-tree',
        name: '松树',
        size: 10,
        solution: [
            [_, _, _, _, X, X, _, _, _, _],
            [_, _, _, X, X, X, X, _, _, _],
            [_, _, X, X, X, X, X, X, _, _],
            [_, X, X, X, X, X, X, X, X, _],
            [_, _, _, X, X, X, X, _, _, _],
            [_, _, X, X, X, X, X, X, _, _],
            [_, X, X, X, X, X, X, X, X, _],
            [X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, X, X, _, _, _, _],
            [_, _, _, _, X, X, _, _, _, _],
        ],
    },
];

export const HARD_PUZZLES: Puzzle[] = [
    {
        id: 'hard-rocket',
        name: '火箭',
        size: 15,
        solution: [
            [_, _, _, _, _, _, _, X, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, X, X, X, _, _, _, _, _, _],
            [_, _, _, _, _, X, X, X, X, X, _, _, _, _, _],
            [_, _, _, _, _, X, X, X, X, X, _, _, _, _, _],
            [_, _, _, _, X, X, X, X, X, X, X, _, _, _, _],
            [_, _, _, _, X, X, X, X, X, X, X, _, _, _, _],
            [_, _, _, _, X, X, X, X, X, X, X, _, _, _, _],
            [_, _, _, X, X, X, X, X, X, X, X, X, _, _, _],
            [_, _, _, X, X, X, X, X, X, X, X, X, _, _, _],
            [_, _, X, X, X, X, X, X, X, X, X, X, X, _, _],
            [_, _, X, X, _, X, X, X, X, X, _, X, X, _, _],
            [_, X, X, _, _, X, X, X, X, X, _, _, X, X, _],
            [_, X, X, _, _, _, X, X, X, _, _, _, X, X, _],
            [X, X, _, _, _, _, X, X, X, _, _, _, _, X, X],
            [X, _, _, _, _, X, X, _, X, X, _, _, _, _, X],
        ],
    },
    {
        id: 'hard-butterfly',
        name: '蝴蝶',
        size: 15,
        solution: [
            [_, _, X, X, _, _, _, _, _, _, _, X, X, _, _],
            [_, X, X, X, X, _, _, _, _, _, X, X, X, X, _],
            [X, X, X, X, X, X, _, _, _, X, X, X, X, X, X],
            [X, X, _, X, X, X, _, _, _, X, X, X, _, X, X],
            [X, X, _, _, X, X, X, _, X, X, X, _, _, X, X],
            [X, X, X, _, _, X, X, X, X, X, _, _, X, X, X],
            [_, X, X, X, _, _, X, X, X, _, _, X, X, X, _],
            [_, _, X, X, X, _, _, X, _, _, X, X, X, _, _],
            [_, X, X, X, _, _, X, X, X, _, _, X, X, X, _],
            [X, X, X, _, _, X, X, X, X, X, _, _, X, X, X],
            [X, X, _, _, X, X, X, _, X, X, X, _, _, X, X],
            [X, X, _, X, X, X, _, _, _, X, X, X, _, X, X],
            [X, X, X, X, X, X, _, _, _, X, X, X, X, X, X],
            [_, X, X, X, X, _, _, _, _, _, X, X, X, X, _],
            [_, _, X, X, _, _, _, _, _, _, _, X, X, _, _],
        ],
    },
];

export const ALL_PUZZLES = {
    easy: EASY_PUZZLES,
    medium: MEDIUM_PUZZLES,
    hard: HARD_PUZZLES,
};
