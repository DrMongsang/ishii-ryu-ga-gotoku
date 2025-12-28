/**
 * 変換コントローラー
 * PDFParserとPPTXGeneratorを連携させて変換処理を制御する
 */

class PDFToPPTXConverter {
    constructor(config) {
        this.config = config;
        this.pdfParser = new PDFParser();
        this.pptxGenerator = new PPTXGenerator(config);
        this.progressCallback = null;
        this.errorCallback = null;
    }

    /**
     * 進捗コールバックを設定
     * @param {Function} callback - 進捗コールバック関数
     */
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    /**
     * エラーコールバックを設定
     * @param {Function} callback - エラーコールバック関数
     */
    setErrorCallback(callback) {
        this.errorCallback = callback;
    }

    /**
     * PDFファイルをPowerPointに変換
     * @param {File} pdfFile - PDFファイルオブジェクト
     * @returns {Promise<void>}
     */
    async convert(pdfFile) {
        try {
            // ステップ1: PDFファイルを読み込み
            this.reportProgress('PDFファイルを読み込み中...', 0);
            const pdfData = await this.readFileAsArrayBuffer(pdfFile);

            // ステップ2: PDFを解析
            this.reportProgress('PDFを解析中...', 10);
            const metadata = await this.pdfParser.loadPDF(pdfData);
            console.log('PDFメタデータ:', metadata);

            // ステップ3: 各ページからテキストを抽出
            this.reportProgress('ページを解析中...', 20);
            const pages = await this.pdfParser.extractAllPages(
                (currentPage, totalPages) => {
                    const progress = 20 + (currentPage / totalPages) * 60;
                    this.reportProgress(
                        `ページ ${currentPage}/${totalPages} を解析中...`,
                        progress
                    );
                }
            );

            // ステップ4: PowerPointを生成
            this.reportProgress('PowerPointを生成中...', 85);
            const fileName = this.getOutputFileName(pdfFile.name);
            await this.pptxGenerator.generatePowerPoint(pages, fileName);

            // ステップ5: 完了
            this.reportProgress('変換完了！', 100);
            console.log('変換が正常に完了しました');

        } catch (error) {
            console.error('変換エラー:', error);
            this.reportError(error);
            throw error;
        } finally {
            // リソースをクリーンアップ
            this.pdfParser.cleanup();
        }
    }

    /**
     * ファイルをArrayBufferとして読み込み
     * @param {File} file - ファイルオブジェクト
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                reject(new Error('ファイルの読み込みに失敗しました: ' + error));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 出力ファイル名を生成
     * @param {string} originalFileName - 元のファイル名
     * @returns {string} 出力ファイル名（拡張子なし）
     */
    getOutputFileName(originalFileName) {
        // ".pdf" を除去して "_converted" を追加
        const baseName = originalFileName.replace(/\.pdf$/i, '');
        return `${baseName}_converted`;
    }

    /**
     * 進捗を報告
     * @param {string} message - 進捗メッセージ
     * @param {number} progress - 進捗率（0-100）
     */
    reportProgress(message, progress) {
        if (this.progressCallback) {
            this.progressCallback({
                message: message,
                progress: Math.round(progress)
            });
        }
        console.log(`[${Math.round(progress)}%] ${message}`);
    }

    /**
     * エラーを報告
     * @param {Error} error - エラーオブジェクト
     */
    reportError(error) {
        if (this.errorCallback) {
            this.errorCallback(error);
        }
    }

    /**
     * 設定情報を取得
     * @returns {Object} 設定情報
     */
    getConfig() {
        return this.config;
    }

    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.pptxGenerator = new PPTXGenerator(this.config);
    }
}

// グローバルに公開
window.PDFToPPTXConverter = PDFToPPTXConverter;
