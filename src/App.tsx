import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { IoHome, IoLibrary, IoStatsChart, IoSettings } from 'react-icons/io5';
import { BookProvider, StatisticsProvider } from '@/context';
import { HomePage, LibraryPage, StatisticsPage, SettingsPage } from '@/pages';
import '@/styles/globals.css';
import styles from './App.module.css';

function Layout() {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <IoHome className={styles.navIcon} />
              <span>首页</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/library"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <IoLibrary className={styles.navIcon} />
              <span>书库</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/statistics"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <IoStatsChart className={styles.navIcon} />
              <span>统计</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <IoSettings className={styles.navIcon} />
              <span>设置</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BookProvider>
        <StatisticsProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="library/:bookId" element={<LibraryPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>
        </StatisticsProvider>
      </BookProvider>
    </BrowserRouter>
  );
}

export default App;
