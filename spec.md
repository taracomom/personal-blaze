# Personal Blaze 仕様書

以下は **「Personal Blaze」― Text Blaze 相当の機能を備えたクロスプラットフォーム専用ツール** の詳細仕様書ドラフトです。Electron を核に OS ネイティブ・ブラウザ拡張の二層構成とし、スラッシュコマンドによるどこでも展開・画像ストレージ・ダブルクリック/URL からの管理画面起動を満たします。

## 0. 概要

Personal Blaze は **「どのアプリでも /コマンド入力→スニペット展開」** を実現しつつ、Text Blaze ライクな GUI を持つオフライン主体の生産性ツールです。UI は Electron 製ネイティブアプリ＋Chrome/Edge 拡張で構成し、

* グローバルキーボードフックで OS 全域を監視し slash 呼び出しを捕捉
* Windows は `SetWindowsHookEx(WH_KEYBOARD_LL)`、macOS は `CGEventTapCreate` で補完
* SQLite + optional PouchDB レイヤでスニペット・画像をローカル保存し将来的なクラウド同期に備える
* タスクトレイ常駐しダブルクリックで管理画面 (React) を開く／`http://localhost:9876` でも同じ UI を提供
* 起動時に自動でトレイ常駐 (Windows レジストリ / LaunchAgent)

を実装指針とします。

## 1. 目的と背景

Text Blaze はブラウザ拡張中心で OS ネイティブ領域には直接対応していません。ユーザ業務（メール・IDE・Slack 等）を完全にカバーするために **クライアント PC 全体で機能する自己完結型ツール** を開発します。Text Blaze が持つフォーム・数式・条件分岐・共有 UI/UX を踏襲しつつ、以下を追加します。

1. 画像スニペット（BLOB or ファイル参照）
2. オフラインファースト
3. ダブルクリック or ブラウザでの管理画面起動
4. Slash トリガーの即時展開

## 2. 範囲 (スコープ)

| 種別  | 対象                                       | 非対象                 |
| --- | ---------------------------------------- | ------------------- |
| OS  | Windows 10/11, macOS 14+                 | Linux, モバイル (将来検討)  |
| UI  | ネイティブ+ブラウザ管理画面, 設定ダイアログ, トレイメニュー         | CLI 管理ツール           |
| 機能  | スニペット CRUD, フォーム, 式, 画像, Autopilot (簡易)  | RPA 高度自動化、SaaS 多者共有 |
| データ | ローカル SQLite/PouchDB, Optional CouchDB 同期 | SaaS クラウド保存         |

## 3. 参照仕様・技術

| 項目             | 採用技術                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| クロスプラットフォーム UI | Electron 28, React 19, TypeScript                                                                                                         |
| グローバルキーボードフック  | Windows: `SetWindowsHookEx WH_KEYBOARD_LL`  macOS: `CGEventTapCreate` |
| 自動起動・トレイ       | electron-auto-launch / native installers |
| 画像ストア          | SQLite BLOB or ファイルパステーブル |
| オフライン同期        | PouchDB → CouchDB レプリケーション |
| UI/UX 参考       | Text Blaze Web UI |

## 4. システムアーキテクチャ

### 4.1 クライアント層

```
┌─────────────┐
│Electron Main │─┬─ globalShortcut / OS hooks (C++)
│               │ ├─ Autostart / Tray
│               │ └─ IPC API (REST over localhost)
├─────────────┤
│Renderer (React)│  ← Snippet Manager UI
└─────────────┘
```

### 4.2 ブラウザ拡張層

* Manifest v3、`content_scripts` で `keydown` を検知し `/` 開始ならローカル API へ問い合わせ → 展開文字列を `document.execCommand` で挿入。

### 4.3 データ層

* **SQLite** (file `~/.personal_blaze/db.sqlite3`)

  * `snippets(id, trigger, content, variables, updated_at)`
  * `images(id, filename, blob, mime)`
* **PouchDB** (IndexedDB) ― スニペットをミラーし、オンライン時に CouchDB sync

## 5. 機能要件

| ID       | 機能          | 詳細                                                      |
| -------- | ----------- | ------------------------------------------------------- |
| **FR-1** | スニペット CRUD  | `/addr` などトリガーとテンプレ本文を編集 GUI で作成                        |
| **FR-2** | ダイナミック入力    | `{formtext:name}`、`{= now() }`、`{if:}` 等 Text Blaze 式互換 |
| **FR-3** | 画像挿入        | スニペットに PNG/JPEG を添付し、展開時にクリップボード経由で貼付                   |
| **FR-4** | Slash エンジン  | 全アプリで `/trigger<space>` → 展開。優先度: エディタ→HTML input→全域    |
| **FR-5** | Autopilot β | `{key:tab}` `{click:.btn-primary}` を実装 (同一ウィンドウ限定)      |
| **FR-6** | 管理画面        | トレイアイコンをダブルクリック or `http://localhost:9876` で開く          |
| **FR-7** | エクスポート      | スニペットと画像を ZIP 書き出し／インポート                                |

## 6. 非機能要件

| 区分     | 要件                                              |
| ------ | ----------------------------------------------- |
| 性能     | 展開遅延 ≤ 50 ms/文字列                                |
| セキュリティ | DB 全体を AES-256 で暗号化 (ユーザマスタパス)                  |
| ローカライズ | UI/ドキュメント 日本語優先、英語 fallback                     |
| 可用性    | オフライン時でも 100 % 機能                               |
| 保守性    | コードベース 80 %+ テストカバレッジ・自動更新 (Squirrel / Sparkle) |

## 7. UI 仕様 (主要画面)

1. **Dashboard**

   * 左: フォルダツリー
   * 中央: スニペット一覧
   * 右: プレビュー / 変数フォーム
2. **スニペットエディタ**

   * Monaco Editor 埋め込み (シンタックスハイライト)
   * 画像アップロードドラッグ＆ドロップ
3. **設定ダイアログ**

   * グローバルショートカット変更
   * DB バックアップ / 同期設定

## 8. 外部インタフェース

| API          | Verb | Path              | 概要                    |
| ------------ | ---- | ----------------- | --------------------- |
| Snippet list | GET  | `/api/snippets`   | JSON 一覧               |
| Create       | POST | `/api/snippets`   | trigger / content     |
| Expand       | POST | `/api/expand`     | body: `{text:"/sig"}` |
| Image        | GET  | `/api/images/:id` | base64 返却             |

## 9. データモデル（ER 図概念）

```
Snippet ───< ImageAttachment
  │id PK      │id PK
  │trigger    │snippet_id FK
  │content    │image_id FK
Image
  │id PK
  │blob / path
```

## 10. マイルストーン

| Phase | 期間      | Deliverables                         |
| ----- | ------- | ------------------------------------ |
| P0    | T0+2 w  | 要件確定・ワイヤーフレーム                        |
| P1    | T0+6 w  | Core Engine (FR-1/4) & Electron Tray |
| P2    | T0+10 w | 管理画面 UI, DB 暗号化                      |
| P3    | T0+14 w | 画像スニペット, Autopilot β                 |
| P4    | T0+18 w | インストーラ, QA, ドキュメント                   |

## 11. リスク & 対策

| リスク                  | 対策                               |
| -------------------- | -------------------------------- |
| OS アップデートでフック API 変更 | Electron 自動更新 + Native Module CI |
| 権限問題 (macOS イベントタップ) | 初回起動時に Accessibility 権限付与ダイアログ誘導 |
| 画像 BLOB 増加による DB 膨張  | 2 MB 超画像はファイル保存＋パス参照             |