# 📚 Cocoro OS Docs

> [Cocoro OS](https://github.com/mdl-systems/cocoro-core) プロジェクトの公式ドキュメントサイトです。

[![Deploy Docs](https://github.com/mdl-systems/cocoro-docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/mdl-systems/cocoro-docs/actions/workflows/deploy.yml)

🌐 **公開URL:** [https://mdl-systems.github.io/cocoro-docs/](https://mdl-systems.github.io/cocoro-docs/)

---

## 概要

Cocoro OS は、Personality AI OS のコアエンジン（`cocoro-core`）を中心に、LAN内管理UI（`cocoro-console`）、公開SNSプラットフォーム（`cocoro-website`）、キッティングインストーラー（`cocoro-installer`）などで構成されるプロジェクトです。

本リポジトリ (`cocoro-docs`) は、これら全リポジトリのドキュメントを集約・公開するための Docusaurus 3 プロジェクトです。

## 開発・プレビュー

```bash
# 依存関係のインストール
npm install

# ローカルサーバー起動（プレビュー）
npm run start
# → http://localhost:3001
```

※ポート番号は `3001` がデフォルトです（他のNext.jsアプリポート3000との競合を防ぐため）。

## ドキュメントの追加・更新

- ページ追加: `docs/` ディレクトリ配下に `.md` または `.mdx` を作成してください。
- アーキテクチャ図等: `docs/architecture.md` を参照してください。
- サイドバーの並び順: `sidebars.ts` または各ファイルのフロントマター (`sidebar_position`) で制御できます。

## デプロイ

`main` ブランチにプッシュされると、GitHub Actions (`.github/workflows/deploy.yml`) により自動的に Docusaurus がビルドされ、`gh-pages` ブランチに反映・公開されます。手動でのデプロイコマンド実行は不要です。

## プロジェクト全体構成（Antigravity用）

**Antigravity (AIエージェント) 向けプロジェクト憲法:**
- [CLAUDE.md](./CLAUDE.md)
  - Antigravityが各セッション開始時に読み込むファイルです。プロジェクト全体のアーキテクチャや依存関係が記載されています。

## ライセンス

Apache License 2.0