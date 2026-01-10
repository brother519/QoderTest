const API_BASE = '/api';
let clickTrendChart = null;

// 加载仪表板数据
async function loadDashboard() {
    try {
        const response = await axios.get(`${API_BASE}/dashboard/overview`);
        const data = response.data.data;

        // 更新统计卡片
        document.getElementById('totalUrls').textContent = data.totalUrls.toLocaleString();
        document.getElementById('activeUrls').textContent = data.activeUrls.toLocaleString();
        document.getElementById('totalClicks').textContent = data.totalClicks.toLocaleString();
        document.getElementById('clicksToday').textContent = data.clicksToday.toLocaleString();

        // 渲染点击趋势图表
        renderClickTrendChart(data.clickTrend);

        // 渲染热门链接表格
        renderTopUrlsTable(data.topUrls);
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
        alert('加载数据失败，请刷新页面重试');
    }
}

// 渲染点击趋势图表
function renderClickTrendChart(trendData) {
    const ctx = document.getElementById('clickTrendChart').getContext('2d');

    if (clickTrendChart) {
        clickTrendChart.destroy();
    }

    clickTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(d => d.date),
            datasets: [{
                label: '点击数',
                data: trendData.map(d => d.clicks),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// 渲染热门链接表格
function renderTopUrlsTable(topUrls) {
    const tbody = document.querySelector('#topUrlsTable tbody');
    tbody.innerHTML = '';

    topUrls.forEach((url, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${url.shortCode}</strong></td>
            <td><a href="${url.originalUrl}" target="_blank" title="${url.originalUrl}">
                ${truncate(url.originalUrl, 50)}
            </a></td>
            <td>${url.clickCount.toLocaleString()}</td>
            <td>
                <button onclick="viewAnalytics('${url.shortCode}')">查看统计</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 创建短链接
document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlInput = document.getElementById('urlInput');
    const customCodeInput = document.getElementById('customCodeInput');
    const resultDiv = document.getElementById('result');

    try {
        const response = await axios.post(`${API_BASE}/urls`, {
            url: urlInput.value,
            customCode: customCodeInput.value || undefined,
        });

        const data = response.data.data;

        // 显示结果
        document.getElementById('shortUrl').textContent = data.shortUrl;
        document.getElementById('shortUrl').href = data.shortUrl;
        document.getElementById('qrCode').src = data.qrCode;
        resultDiv.style.display = 'block';

        // 重新加载仪表板数据
        loadDashboard();
    } catch (error) {
        console.error('创建短链接失败:', error);
        const message = error.response?.data?.error?.message || '创建失败，请稍后重试';
        alert(message);
    }
});

// 复制链接到剪贴板
function copyToClipboard() {
    const shortUrl = document.getElementById('shortUrl').textContent;
    navigator.clipboard.writeText(shortUrl).then(() => {
        alert('链接已复制到剪贴板');
    }).catch(() => {
        alert('复制失败，请手动复制');
    });
}

// 查看统计
function viewAnalytics(shortCode) {
    alert(`查看 ${shortCode} 的统计数据功能开发中...`);
    // 可以扩展为弹窗显示详细统计
}

// 截断长文本
function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    // 每30秒刷新一次数据
    setInterval(loadDashboard, 30000);
});
