# GitHub Pagesへのデプロイガイド

このドキュメントでは、PDF to PowerPoint ConverterをGitHub Pagesにデプロイする手順を説明します。

## 前提条件

- Gitがインストールされていること
- GitHubアカウントを持っていること

## デプロイ手順

### 1. GitHubリポジトリの作成

GitHubで新しいリポジトリを作成します。

1. GitHub.comにログイン
2. 右上の「+」アイコンをクリック → 「New repository」
3. リポジトリ名を入力（例: `pdf-to-pptx-converter`）
4. Publicを選択（GitHub Pages無料プランではPublicリポジトリが必要）
5. 「Create repository」をクリック

### 2. ローカルリポジトリの初期化とプッシュ

プロジェクトのルートディレクトリで以下のコマンドを実行します。

```bash
# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: PDF to PowerPoint Converter with FABRIC TOKYO theme"

# メインブランチに変更（GitHubのデフォルトに合わせる）
git branch -M main

# リモートリポジトリを追加（your-usernameを自分のユーザー名に置き換え）
git remote add origin https://github.com/your-username/pdf-to-pptx-converter.git

# プッシュ
git push -u origin main
```

### 3. GitHub Pagesの有効化

1. GitHubリポジトリページで「Settings」タブをクリック
2. 左メニューから「Pages」を選択
3. 「Source」セクションで以下を設定：
   - Branch: `main` を選択
   - Folder: `/ (root)` を選択
4. 「Save」をクリック

### 4. デプロイ完了の確認

数分後、GitHub Pagesのセクションに以下のようなメッセージが表示されます：

```
Your site is live at https://your-username.github.io/pdf-to-pptx-converter/
```

このURLにアクセスして、アプリケーションが正常に動作することを確認してください。

## カスタムドメインの設定（オプション）

独自ドメインを使用したい場合：

1. GitHub Pages設定ページの「Custom domain」にドメインを入力
2. DNSプロバイダーでCNAMEレコードを設定
   ```
   CNAME your-username.github.io
   ```
3. 「Enforce HTTPS」にチェックを入れる

## トラブルシューティング

### デプロイ後にページが表示されない

- ブラウザのキャッシュをクリア
- GitHubリポジトリが公開（Public）になっているか確認
- `index.html` がルートディレクトリに存在するか確認

### 設定ファイル（config.yml）が読み込めない

- ブラウザのコンソールでエラーを確認
- ファイルパスが正しいか確認（GitHub Pagesでは相対パスを使用）
- YAMLの構文エラーがないか確認

### CDNライブラリが読み込めない

- ブラウザのコンソールでネットワークエラーを確認
- HTTPSでホストされているか確認（GitHub PagesはHTTPS）
- CDN URLが正しいか確認

## 更新のプッシュ

コードを更新した場合は、以下のコマンドで変更をプッシュします：

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Update: 機能追加の説明"

# プッシュ
git push origin main
```

プッシュ後、数分でGitHub Pagesに反映されます。

## ローカルテスト

GitHub Pagesにデプロイする前に、ローカルでテストすることをお勧めします：

```bash
# Python 3を使用
python -m http.server 8000

# または Node.jsを使用
npx http-server -p 8000
```

ブラウザで `http://localhost:8000` を開いて動作確認してください。

## セキュリティ注意事項

- すべての処理はクライアントサイド（ブラウザ）で実行されます
- PDFファイルはサーバーにアップロードされません
- APIキーや秘密情報をコードに含めないでください

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください：
```
https://github.com/your-username/pdf-to-pptx-converter/issues
```

---

**デプロイ完了後、URLをREADME.mdに追加することをお勧めします**
