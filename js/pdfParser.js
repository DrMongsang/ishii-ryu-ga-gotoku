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

        console.log(`ページ ${pageNum}: ${textContent.items.length}個のテキストアイテム`);

        // テキストアイテムを行ごとにグループ化
        const lines = this.groupTextByLines(textContent.items);

        // タイトルと本文を分離
        const title = this.extractTitle(lines);
        const content = this.extractContent(lines);

        console.log(`ページ ${pageNum} - タイトル: "${title.substring(0, 50)}", 本文: ${content.length}文字`);

        return {
            pageNumber: pageNum,
            title: title || `ページ ${pageNum}`, // タイトルが空の場合のフォールバック
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
            console.warn('PDF Parser: テキストアイテムが空です');
            return [];
        }

        console.log(`PDF Parser: ${textItems.length}個のテキストアイテムを処理中`);

        // Y座標でソート（上から下へ）
        const sortedItems = textItems
            .map(item => ({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5]
            }))
            .filter(item => item.text && item.text.trim())
            .sort((a, b) => b.y - a.y); // Y座標降順（上が大きい）

        if (sortedItems.length === 0) {
            console.warn('PDF Parser: 有効なテキストがありません');
            return [];
        }

        // Y座標でグループ化（同じ行とみなす範囲）
        const lineGroups = [];
        let currentGroup = [sortedItems[0]];
        const yThreshold = 5; // 同じ行とみなすY座標の差

        for (let i = 1; i < sortedItems.length; i++) {
            const item = sortedItems[i];
            const lastItem = currentGroup[currentGroup.length - 1];

            if (Math.abs(item.y - lastItem.y) <= yThreshold) {
                // 同じ行に追加
                currentGroup.push(item);
            } else {
                // 新しい行を開始
                // X座標でソート（左から右へ）
                currentGroup.sort((a, b) => a.x - b.x);
                lineGroups.push(currentGroup);
                currentGroup = [item];
            }
        }

        // 最後のグループを追加
        if (currentGroup.length > 0) {
            currentGroup.sort((a, b) => a.x - b.x);
            lineGroups.push(currentGroup);
        }

        // 各行のテキストを結合
        const lines = lineGroups.map(group =>
            group.map(item => item.text.trim()).join(' ').trim()
        ).filter(line => line.length > 0);

        console.log(`PDF Parser: ${lines.length}行のテキストを抽出しました`);
        if (lines.length > 0) {
            console.log(`最初の行: "${lines[0].substring(0, 50)}..."`);
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
