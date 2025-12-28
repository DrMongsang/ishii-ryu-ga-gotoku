/**
 * PowerPoint生成モジュール
 * ページデータと設定ファイルからPowerPointファイルを生成する
 */

class PPTXGenerator {
    constructor(config) {
        this.config = config;
        this.pptx = null;
    }

    /**
     * PowerPointファイルを生成
     * @param {Array} pages - ページデータの配列
     * @param {string} fileName - 出力ファイル名（拡張子なし）
     * @returns {Promise<void>}
     */
    async generatePowerPoint(pages, fileName = 'converted') {
        try {
            // PptxGenJSインスタンスを作成
            this.pptx = new PptxGenJS();

            // スライドサイズを設定
            this.pptx.defineLayout({
                name: 'FABRIC_TOKYO',
                width: this.config.design.layout.slide_width,
                height: this.config.design.layout.slide_height
            });
            this.pptx.layout = 'FABRIC_TOKYO';

            // 各ページをスライドに変換
            pages.forEach((page, index) => {
                this.createSlide(page, index);
            });

            // PowerPointファイルをダウンロード
            await this.pptx.writeFile({ fileName: `${fileName}.pptx` });

            console.log('PowerPoint生成完了:', `${fileName}.pptx`);
        } catch (error) {
            console.error('PowerPoint生成エラー:', error);
            throw new Error('PowerPointの生成に失敗しました: ' + error.message);
        }
    }

    /**
     * スライドを作成
     * @param {Object} pageData - ページデータ
     * @param {number} index - ページインデックス
     */
    createSlide(pageData, index) {
        const slide = this.pptx.addSlide();

        // 1ページ目はタイトルスライド、それ以降はコンテンツスライド
        if (index === 0) {
            this.createTitleSlide(slide, pageData);
        } else {
            this.createContentSlide(slide, pageData);
        }

        // フッターを追加（設定で有効な場合）
        if (this.config.branding?.footer?.enabled) {
            this.addFooter(slide);
        }
    }

    /**
     * タイトルスライドを作成
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {Object} pageData - ページデータ
     */
    createTitleSlide(slide, pageData) {
        const template = this.config.conversion.slide_templates.title_slide;
        const titleFont = this.config.design.fonts.title;

        // タイトル
        slide.addText(pageData.title || 'Untitled', {
            x: template.title.x,
            y: template.title.y,
            w: template.title.width,
            h: template.title.height,
            fontSize: titleFont.size,
            bold: titleFont.bold,
            color: this.hexToRGB(titleFont.color),
            fontFace: titleFont.family,
            align: template.title.align,
            valign: template.title.valign,
            // 改行割れ・文字つぶれ防止の設定
            lineSpacing: this.calculateLineSpacing(titleFont.line_height),
            wrap: true,              // 自動折り返し
            autoFit: false,          // 自動縮小を無効化（文字つぶれ防止）
            breakLine: true          // 改行を保持
        });

        // サブタイトル（本文がある場合）
        if (pageData.content) {
            const bodyFont = this.config.design.fonts.body;
            slide.addText(pageData.content, {
                x: template.subtitle.x,
                y: template.subtitle.y,
                w: template.subtitle.width,
                h: template.subtitle.height,
                fontSize: bodyFont.size,
                bold: bodyFont.bold,
                color: this.hexToRGB(bodyFont.color),
                fontFace: bodyFont.family,
                align: template.subtitle.align,
                valign: template.subtitle.valign,
                // 改行割れ・文字つぶれ防止の設定
                lineSpacing: this.calculateLineSpacing(bodyFont.line_height),
                wrap: true,
                autoFit: false,
                breakLine: true
            });
        }
    }

    /**
     * コンテンツスライドを作成
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {Object} pageData - ページデータ
     */
    createContentSlide(slide, pageData) {
        const template = this.config.conversion.slide_templates.content_slide;
        const titleFont = this.config.design.fonts.title;
        const bodyFont = this.config.design.fonts.body;

        // タイトル
        slide.addText(pageData.title || `スライド ${pageData.pageNumber}`, {
            x: template.title.x,
            y: template.title.y,
            w: template.title.width,
            h: template.title.height,
            fontSize: titleFont.size,
            bold: titleFont.bold,
            color: this.hexToRGB(titleFont.color),
            fontFace: titleFont.family,
            align: template.title.align,
            valign: template.title.valign,
            // 改行割れ・文字つぶれ防止の設定
            lineSpacing: this.calculateLineSpacing(titleFont.line_height),
            wrap: true,
            autoFit: false,
            breakLine: true
        });

        // 本文
        if (pageData.content) {
            // 箇条書きを検出して適用
            const contentText = this.formatContent(pageData.content);

            slide.addText(contentText, {
                x: template.content.x,
                y: template.content.y,
                w: template.content.width,
                h: template.content.height,
                fontSize: bodyFont.size,
                bold: bodyFont.bold,
                color: this.hexToRGB(bodyFont.color),
                fontFace: bodyFont.family,
                align: template.content.align,
                valign: template.content.valign,
                bullet: this.hasBulletPoints(pageData.content),
                // 改行割れ・文字つぶれ防止の設定
                lineSpacing: this.calculateLineSpacing(bodyFont.line_height),
                wrap: true,
                autoFit: false,
                breakLine: true
            });
        }
    }

    /**
     * コンテンツをフォーマット
     * @param {string} content - 本文
     * @returns {Array|string} フォーマットされた本文
     */
    formatContent(content) {
        // 箇条書きを検出
        if (this.hasBulletPoints(content)) {
            return content.split('\n').map(line => {
                // 箇条書き記号を除去
                return line.replace(/^[•\-\*]\s*/, '').trim();
            }).filter(line => line.length > 0);
        }

        return content;
    }

    /**
     * 箇条書きを含むか判定
     * @param {string} text - テキスト
     * @returns {boolean}
     */
    hasBulletPoints(text) {
        return /^[•\-\*]\s/m.test(text);
    }

    /**
     * フッターを追加
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     */
    addFooter(slide) {
        const footer = this.config.branding.footer;

        slide.addText(footer.text, {
            x: footer.position.x,
            y: footer.position.y,
            fontSize: footer.font_size,
            color: this.hexToRGB(footer.color),
            align: 'left'
        });
    }

    /**
     * Hex色コードをRGB形式に変換
     * @param {string} hex - Hex色コード（例: "#2C5F2D"）
     * @returns {string} RGB形式（例: "2C5F2D"）
     */
    hexToRGB(hex) {
        // "#"を除去
        return hex.replace('#', '');
    }

    /**
     * 行間を計算（line_heightをPptxGenJSの形式に変換）
     * @param {number} lineHeight - 行間倍率（例: 1.4）
     * @returns {number} PptxGenJSのlineSpacing値（ポイント単位）
     */
    calculateLineSpacing(lineHeight) {
        // line_heightが設定されていない場合はデフォルト値を返す
        if (!lineHeight) return undefined;

        // PptxGenJSのlineSpacingはポイント単位で、行の高さの倍率として機能
        // line_height 1.4 → lineSpacing 40 (140%の意味)
        // line_height 1.6 → lineSpacing 60 (160%の意味)
        return Math.round((lineHeight - 1) * 100);
    }

    /**
     * プレビュー用のスライド情報を取得
     * @returns {Object} スライド情報
     */
    getSlideInfo() {
        return {
            layout: this.config.design.layout,
            theme: this.config.design.theme,
            fonts: this.config.design.fonts
        };
    }
}

// グローバルに公開
window.PPTXGenerator = PPTXGenerator;
