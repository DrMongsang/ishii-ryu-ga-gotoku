# 石井龍が如く（最強のPDF→パワポ変換ツール）

**vibed by MONGSANG SOFT**

PDFファイルをドラッグ&ドロップで美しいPowerPointプレゼンテーションに変換する、最強のWebアプリケーション。

## 特徴

- **ブラウザで完結**: サーバー不要、完全にクライアントサイドで動作
- **ドラッグ&ドロップ対応**: 直感的な操作でPDFをアップロード
- **カスタマイズ可能**: YAMLファイルでテンプレート、カラー、フォントを自由にカスタマイズ
- **FABRIC TOKYO最適化**: FABRIC TOKYOブランドガイドラインに準拠したデザイン
- **プログレス表示**: 変換進捗をリアルタイムで表示
- **GitHub Pages対応**: 静的サイトとしてホスティング可能

## デモ

```
https://your-username.github.io/pdf-to-pptx-converter/
```

## 使い方

### 1. 基本的な使い方

1. ブラウザで `index.html` を開く
2. PDFファイルをドラッグ&ドロップ（または「ファイルを選択」ボタンをクリック）
3. 「PowerPointに変換」ボタンをクリック
4. 自動的にPowerPointファイル（.pptx）がダウンロードされる

### 2. ローカルでの起動

```bash
# リポジトリをクローン
git clone https://github.com/your-username/pdf-to-pptx-converter.git
cd pdf-to-pptx-converter

# ローカルサーバーを起動（例: Python）
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

または、単純に `index.html` をブラウザで開くだけでも動作します。

## カスタマイズ

### テンプレート設定（config.yml）

`config.yml` を編集することで、デザインをカスタマイズできます。

#### カラーの変更

```yaml
design:
  theme:
    primary_color: "#2C5F2D"      # メインカラー
    secondary_color: "#97BC62"    # サブカラー
    background_color: "#FFFFFF"   # 背景色
```

#### フォントの変更

```yaml
design:
  fonts:
    title:
      family: "Arial"
      size: 32
      bold: true
    body:
      family: "Arial"
      size: 18
      bold: false
```

#### レイアウトの調整

```yaml
conversion:
  slide_templates:
    content_slide:
      title:
        x: 0.5          # 左からの位置（インチ）
        y: 0.5          # 上からの位置（インチ）
        width: 9.0      # 幅（インチ）
        height: 0.8     # 高さ（インチ）
```

### 複数テンプレートの作成

複数の設定ファイルを作成して、用途別にテンプレートを使い分けることができます：

```
config/
├── fabric-tokyo-standard.yml    # 標準テンプレート
├── fabric-tokyo-training.yml    # 研修用テンプレート
├── fabric-tokyo-proposal.yml    # 提案用テンプレート
└── fabric-tokyo-report.yml      # 報告用テンプレート
```

## 技術スタック

- **HTML5 + CSS3 + Vanilla JavaScript**: フロントエンド
- **PDF.js**: PDFファイルの解析
- **PptxGenJS**: PowerPointファイルの生成
- **js-yaml**: YAML設定ファイルの読み込み

すべてCDN経由で読み込むため、ビルドプロセス不要。

## プロジェクト構成

```
pdf-to-pptx-converter/
├── index.html              # メインHTML
├── styles.css              # スタイルシート
├── config.yml              # 設定ファイル
├── js/
│   ├── main.js            # メインロジック・UI制御
│   ├── pdfParser.js       # PDF解析機能
│   ├── converter.js       # 変換制御
│   └── pptxGenerator.js   # PowerPoint生成機能
└── README.md              # このファイル
```

## 各モジュールの役割

### pdfParser.js
- PDFファイルの読み込み
- テキスト抽出
- ページごとの解析
- メタデータの取得

### pptxGenerator.js
- PowerPointファイルの生成
- スライドのレイアウト設定
- テンプレートの適用
- スタイルのカスタマイズ

### converter.js
- PDF解析とPowerPoint生成の統合
- 変換プロセスの制御
- 進捗管理
- エラーハンドリング

### main.js
- UI操作の処理
- ドラッグ&ドロップ
- ファイル選択
- 設定ファイルの読み込み
- モジュール間の連携

## GitHub Pagesへのデプロイ

### 1. GitHubリポジトリを作成

```bash
git init
git add .
git commit -m "Initial commit: PDF to PowerPoint Converter"
git branch -M main
git remote add origin https://github.com/your-username/pdf-to-pptx-converter.git
git push -u origin main
```

### 2. GitHub Pagesを有効化

1. GitHubリポジトリの「Settings」を開く
2. 左メニューから「Pages」を選択
3. Source: `main` ブランチを選択
4. フォルダ: `/ (root)` を選択
5. 「Save」をクリック

数分後、以下のURLでアクセス可能になります：
```
https://your-username.github.io/pdf-to-pptx-converter/
```

## NotebookLMとの連携

NotebookLMで生成したPDFを直接変換できます：

1. NotebookLMでプレゼン資料をPDFとして生成
2. このツールでPDFをドロップ
3. FABRIC TOKYOスタイルのPowerPointに自動変換

## トラブルシューティング

### PDFが読み込めない
- PDFファイルが破損していないか確認
- ファイルサイズが大きすぎる場合は、分割して変換

### 設定ファイルが読み込めない
- `config.yml` の構文エラーをチェック
- YAMLのインデントは半角スペースを使用（タブ不可）

### PowerPointが正しく生成されない
- ブラウザのコンソールでエラーを確認
- 設定ファイルのレイアウト値を確認

### 日本語が表示されない
- フォント設定を確認
- 日本語対応フォント（Noto Sans JP など）を指定

## ブラウザ対応

- Chrome: ✅ 推奨
- Firefox: ✅ 対応
- Safari: ✅ 対応
- Edge: ✅ 対応

## ライセンス

MIT License

## 開発者向け

### ローカル開発

```bash
# Live Serverを使用（VSCode拡張機能）
# または
npx http-server -p 8000
```

### デバッグモード

ブラウザの開発者ツール（F12）でコンソールログを確認できます：

```javascript
// config.ymlの設定を確認
console.log(appConfig);

// 変換中の進捗を確認
// コンソールに "[50%] ページ 5/10 を解析中..." などと表示されます
```

### カスタマイズ例

#### 1. ロゴの追加

```yaml
branding:
  logo:
    enabled: true
    path: "assets/logo.png"
    position:
      x: 9.0
      y: 0.3
      width: 0.8
      height: 0.4
```

#### 2. 背景画像の追加

```javascript
// pptxGenerator.js の createSlide メソッドに追加
slide.background = {
    path: 'assets/background.png'
};
```

## 今後の拡張案

- [ ] 画像抽出・配置機能
- [ ] 複数テンプレートのUI選択
- [ ] OCR対応（スキャンPDF対応）
- [ ] ページ範囲指定
- [ ] バッチ変換（複数PDFを一括変換）
- [ ] プレビュー機能
- [ ] Zip一括ダウンロード

## サポート

問題や質問がある場合は、GitHubのIssuesにお願いします：
```
https://github.com/your-username/pdf-to-pptx-converter/issues
```

## コントリビューション

プルリクエスト歓迎！

1. フォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

**Made with ❤️ for FABRIC TOKYO**
