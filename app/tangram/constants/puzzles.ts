import { PuzzleDef } from '../types/game';

export const PUZZLES: PuzzleDef[] = [
    {
        id: 'square',
        name: '正方形',
        icon: '⬜',
        difficulty: '简单',
        silhouette: {
            polygons: [
                [
                    { x: 0, y: 0 },
                    { x: 4, y: 0 },
                    { x: 4, y: 4 },
                    { x: 0, y: 4 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 1.0, y: 7.5 },
            largeTriangle2: { x: 2.8, y: 7.5 },
            mediumTriangle: { x: 4.6, y: 7.5 },
            square: { x: 6.2, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            parallelogram: { x: 4.8, y: 9.2 },
        },
    },
    {
        id: 'triangle',
        name: '三角形',
        icon: '🔺',
        difficulty: '简单',
        silhouette: {
            polygons: [
                [
                    { x: 0, y: 0 },
                    { x: 5.66, y: 0 },
                    { x: 2.83, y: 5.66 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 0.8, y: 7.5 },
            largeTriangle2: { x: 2.6, y: 7.5 },
            mediumTriangle: { x: 4.4, y: 7.5 },
            parallelogram: { x: 6.0, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            square: { x: 4.4, y: 9.2 },
        },
    },
    {
        id: 'house',
        name: '房子',
        icon: '🏠',
        difficulty: '中等',
        silhouette: {
            polygons: [
                [
                    { x: 0.2, y: 2.2 },
                    { x: 2.2, y: 0 },
                    { x: 4.2, y: 2.2 },
                    { x: 4.2, y: 5.5 },
                    { x: 0.2, y: 5.5 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 0.8, y: 7.5 },
            largeTriangle2: { x: 2.6, y: 7.5 },
            mediumTriangle: { x: 4.4, y: 7.5 },
            square: { x: 6.0, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            parallelogram: { x: 4.8, y: 9.2 },
        },
    },
    {
        id: 'boat',
        name: '帆船',
        icon: '⛵',
        difficulty: '中等',
        silhouette: {
            polygons: [
                [
                    { x: 0.5, y: 1 },
                    { x: 3, y: 0 },
                    { x: 3, y: 3.5 },
                    { x: 5.5, y: 1 },
                    { x: 6, y: 4 },
                    { x: 0, y: 4 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 0.8, y: 7.5 },
            largeTriangle2: { x: 2.6, y: 7.5 },
            mediumTriangle: { x: 4.4, y: 7.5 },
            parallelogram: { x: 6.0, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            square: { x: 4.4, y: 9.2 },
        },
    },
    {
        id: 'cat',
        name: '小猫',
        icon: '🐱',
        difficulty: '困难',
        silhouette: {
            polygons: [
                [
                    { x: 0.5, y: 2 },
                    { x: 4.5, y: 2 },
                    { x: 4.5, y: 5.5 },
                    { x: 0.5, y: 5.5 },
                ],
                [
                    { x: 1.5, y: 2 },
                    { x: 3.5, y: 2 },
                    { x: 3.5, y: 0 },
                    { x: 2.5, y: 1 },
                    { x: 1.5, y: 0 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 0.8, y: 7.5 },
            largeTriangle2: { x: 2.6, y: 7.5 },
            mediumTriangle: { x: 4.4, y: 7.5 },
            square: { x: 6.0, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            parallelogram: { x: 4.8, y: 9.2 },
        },
    },
    {
        id: 'runner',
        name: '奔跑者',
        icon: '🏃',
        difficulty: '困难',
        silhouette: {
            polygons: [
                [
                    { x: 1.5, y: 0 },
                    { x: 3.5, y: 0 },
                    { x: 3.5, y: 5.5 },
                    { x: 1.5, y: 5.5 },
                ],
                [
                    { x: 0, y: 1.8 },
                    { x: 5.5, y: 1.8 },
                    { x: 5.5, y: 3.5 },
                    { x: 0, y: 3.5 },
                ],
            ],
        },
        pieceStartPositions: {
            largeTriangle1: { x: 0.8, y: 7.5 },
            largeTriangle2: { x: 2.6, y: 7.5 },
            mediumTriangle: { x: 4.4, y: 7.5 },
            parallelogram: { x: 6.0, y: 7.5 },
            smallTriangle1: { x: 1.2, y: 9.2 },
            smallTriangle2: { x: 2.8, y: 9.2 },
            square: { x: 4.4, y: 9.2 },
        },
    },
];
