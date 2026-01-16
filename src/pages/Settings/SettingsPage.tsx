import React, { useRef } from 'react';
import { useBookContext, useStatisticsContext } from '@/context';
import { Button } from '@/components/common';
import { STORAGE_KEYS } from '@/utils/storage';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { books, readingLogs } = useBookContext();
  const { readingGoal, readingStreak, resetYearlyGoal } = useStatisticsContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      books,
      readingLogs,
      readingGoal,
      readingStreak,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reading-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.books) {
          localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(data.books));
        }
        if (data.readingLogs) {
          localStorage.setItem(STORAGE_KEYS.READING_LOGS, JSON.stringify(data.readingLogs));
        }
        if (data.readingGoal) {
          localStorage.setItem(STORAGE_KEYS.READING_GOAL, JSON.stringify(data.readingGoal));
        }
        if (data.readingStreak) {
          localStorage.setItem(STORAGE_KEYS.READING_STREAK, JSON.stringify(data.readingStreak));
        }

        alert('导入成功！页面将刷新。');
        window.location.reload();
      } catch {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    if (
      window.confirm('确定要清空所有数据吗？此操作不可恢复！')
    ) {
      if (window.confirm('再次确认：所有书籍和阅读记录都将被删除！')) {
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
        window.location.reload();
      }
    }
  };

  const handleResetGoal = () => {
    if (window.confirm('确定要重置年度目标吗？')) {
      resetYearlyGoal();
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>设置</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>数据管理</h2>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>导出数据</p>
            <p className={styles.settingDescription}>将所有数据导出为 JSON 文件</p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            导出
          </Button>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>导入数据</p>
            <p className={styles.settingDescription}>从备份文件恢复数据</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className={styles.fileInput}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            导入
          </Button>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>重置年度目标</p>
            <p className={styles.settingDescription}>将年度阅读目标重置为默认值</p>
          </div>
          <Button variant="secondary" onClick={handleResetGoal}>
            重置
          </Button>
        </div>
      </div>

      <div className={`${styles.section} ${styles.dangerZone}`}>
        <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>危险区域</h2>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <p className={styles.settingLabel}>清空所有数据</p>
            <p className={styles.settingDescription}>删除所有书籍和阅读记录，此操作不可恢复</p>
          </div>
          <Button variant="danger" onClick={handleClearData}>
            清空
          </Button>
        </div>
      </div>

      <p className={styles.version}>阅读追踪 v1.0.0</p>
    </div>
  );
}
