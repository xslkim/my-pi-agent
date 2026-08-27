#!/usr/bin/env bash
# 校验五份指导方案的「通用底线」节逐字一致（各文档该节声明：修改须五处同步）
set -u
cd "$(dirname "$0")"
ref=""; refname=""
for f in method-*.md process-*.md; do
  cur=$(sed -n '/^## 通用底线/,/^## /p' "$f" | sed '1d;$d')
  if [ -z "$ref" ]; then
    ref="$cur"; refname="$f"
  elif [ "$cur" != "$ref" ]; then
    echo "FAIL: $f 与 $refname 的通用底线不一致" >&2
    diff <(echo "$ref") <(echo "$cur") | head -20
    exit 1
  fi
done
echo "OK: 五份通用底线逐字一致"
