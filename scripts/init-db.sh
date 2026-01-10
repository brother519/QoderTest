#!/bin/bash
set -e

echo "等待PostgreSQL启动..."
until pg_isready -h postgres -U shortlink; do
  sleep 1
done

echo "执行数据库迁移..."
for file in /docker-entrypoint-initdb.d/*.sql; do
  echo "执行: $file"
  psql -U shortlink -d shortlink -f "$file"
done

echo "数据库初始化完成"
