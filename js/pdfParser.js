/**
 * PDF解析モジュール
 * PDFファイルからテキスト、画像、メタデータを抽出する
 */

class PDFParser {
    constructor() {
        this.pdfDocument = null;
        this.pages = [];
    }

    /**
     * PDFファイルを読み込む
     * @param {ArrayBuffer} pdfData - PDFファイルのバイナリデータ
     * @returns {Promise<Object>} PDFドキュメント情報
     */
    async loadPDF(pdfData) {
        try {
            // PDF.jsでドキュメントを読み込み
            this.pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;

            const metadata = await this.extractMetadata();
            console.log('PDF読み込み完了:', metadata);

            return metadata;
        } catch (error) {
            console.error('PDF読み込みエラー:', error);
            throw new Error('PDFファイルの読み込みに失敗しました: ' + error.message);
        }
    }

    /**
     * PDFのメタデータを抽出
     * @returns {Promise<Object>} メタデータ
     */
    async extractMetadata() {
        if (!this.pdfDocument) {
            throw new Error('PDFドキュメントが読み込まれていません');
        }

        const metadata = await this.pdfDocument.getMetadata();

        return {
            numPages: this.pdfDocument.numPages,
            title: metadata.info?.Title || 'Untitled',
            author: metadata.info?.Author || 'Unknown',
            subject: metadata.info?.Subject || '',
            creator: metadata.info?.Creator || '',
            producer: metadata.info?.Producer || '',
            creationDate: metadata.info?.CreationDate || null
        };
    }

    /**
     * すべてのページからテキストを抽出
     * @param {Function} progressCallback - 進捗コールバック関数
     * @returns {Promise<Array>} ページデータの配列
     */
    async extractAllPages(progressCallback = null) {
        if (!this.pdfDocument) {
            throw new Error('PDFドキュメントが読み込まれていません');
        }

        this.pages = [];
        const totalPages = this.pdfDocument.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            try {
                const pageData = await this.extractPage(pageNum);
                this.pages.push(pageData);

                // 進捗を報告
                if (progressCallback) {
                    progressCallback(pageNum, totalPages);
                }

                console.log(`ページ ${pageNum}/${totalPages} 解析完了`);
            } catch (error) {
                console.error(`ページ ${pageNum} の解析エラー:`, error);
                // エラーが発生してもスキップして続行
                this.pages.push({
                    pageNumber: pageNum,
                    title: '',
                    content: `[ページ ${pageNum} の読み込みに失敗しました]`,
                    rawText: '',
                    textItems: []
                });
            }
        }

        return this.pages;
    }

    /**
     * 特定のページからテキストを抽出
     * @param {number} pageNum - ページ番号（1始まり）
     * @returns {Promise<Object>} ページデータ
     */
    async extractPage(pageNum) {
        const page = await this.pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // テキストアイテムを行ごとにグループ化
        const lines = this.groupTextByLines(textContent.items);

        // タイトルと本文を分離
        const title = this.extractTitle(lines);
        const content = this.extractContent(lines);

        return {
            pageNumber: pageNum,
            title: title,
            content: content,
            rawText: lines.join('\n'),
            textItems: textContent.items
        };
    }

    /**
     * テキストアイテムを行ごとにグループ化
     * @param {Array} textItems - PDF.jsのテキストアイテム配列
     * @returns {Array<string>} 行の配列
     */
    groupTextByLines(textItems) {
        if (!textItems || textItems.length === 0) {
            return [];
        }

        const lines = [];
        let currentLine = '';
        let lastY = null;
        const yThreshold = 2; // Y座標の許容誤差

        textItems.forEach((item, index) => {
            const text = item.str.trim();
            if (!text) return;

            const currentY = item.transform[5];

            // 新しい行の判定（Y座標が変化した場合）
            if (lastY !== null && Math.abs(currentY - lastY) > yThreshold) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                }
                currentLine = text;
            } else {
                // 同じ行に追加
                currentLine += (currentLine ? ' ' : '') + text;
            }

            lastY = currentY;
        });

        // 最後の行を追加
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        return lines;
    }

    /**
     * 行の配列からタイトルを抽出
     * @param {Array<string>} lines - 行の配列
     * @returns {string} タイトル
     */
    extractTitle(lines) {
        if (lines.length === 0) return '';

        // 最初の行をタイトルとする
        // より高度な判定（フォントサイズなど）も可能だが、シンプルに実装
        return lines[0] || '';
    }

    /**
     * 行の配列から本文を抽出
     * @param {Array<string>} lines - 行の配列
     * @returns {string} 本文
     */
    extractContent(lines) {
        if (lines.length <= 1) return '';

        // タイトル以降の行を本文とする
        return lines.slice(1).join('\n');
    }

    /**
     * テキストをクリーンアップ
     * @param {string} text - テキスト
     * @returns {string} クリーンアップされたテキスト
     */
    cleanupText(text) {
        return text
            .replace(/\s+/g, ' ')           // 連続する空白を1つに
            .replace(/\n\s*\n/g, '\n')      // 連続する改行を1つに
            .trim();
    }

    /**
     * ページデータを取得
     * @returns {Array} ページデータの配列
     */
    getPages() {
        return this.pages;
    }

    /**
     * リソースを解放
     */
    cleanup() {
        if (this.pdfDocument) {
            this.pdfDocument.destroy();
            this.pdfDocument = null;
        }
        this.pages = [];
    }
}

// グローバルに公開
window.PDFParser = PDFParser;
