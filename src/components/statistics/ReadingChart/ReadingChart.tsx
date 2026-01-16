import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStatisticsContext } from '@/context';
import styles from './ReadingChart.module.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface ReadingChartProps {
  type: 'monthly' | 'category';
}

export function ReadingChart({ type }: ReadingChartProps) {
  const { statistics } = useStatisticsContext();

  if (type === 'monthly') {
    const data = Object.entries(statistics.booksByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: month.slice(5),
        count,
      }));

    if (data.length === 0) {
      return (
        <div className={styles.card}>
          <h3 className={styles.title}>月度阅读</h3>
          <div className={styles.empty}>暂无阅读数据</div>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <h3 className={styles.title}>月度阅读</h3>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="完成书籍" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'category') {
    const data = Object.entries(statistics.booksByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    if (data.length === 0) {
      return (
        <div className={styles.card}>
          <h3 className={styles.title}>分类统计</h3>
          <div className={styles.empty}>暂无分类数据</div>
        </div>
      );
    }

    return (
      <div className={styles.card}>
        <h3 className={styles.title}>分类统计</h3>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}
