// 检测两张卡片是否重叠
function isOverlapping(cardA, cardB, cardSize, threshold = 0.5) {
    const overlapThreshold = cardSize * threshold;

    const aLeft = cardA.x;
    const aRight = cardA.x + cardSize;
    const aTop = cardA.y;
    const aBottom = cardA.y + cardSize;

    const bLeft = cardB.x;
    const bRight = cardB.x + cardSize;
    const bTop = cardB.y;
    const bBottom = cardB.y + cardSize;

    // 计算重叠区域
    const overlapX = Math.max(0, Math.min(aRight, bRight) - Math.max(aLeft, bLeft));
    const overlapY = Math.max(0, Math.min(aBottom, bBottom) - Math.max(aTop, bTop));

    return overlapX >= overlapThreshold && overlapY >= overlapThreshold;
}

module.exports = { isOverlapping };
