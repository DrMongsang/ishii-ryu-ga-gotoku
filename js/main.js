/**
 * メインアプリケーション
 * UI操作とモジュール統合
 */

// グローバル変数
let appConfig = null;
let converter = null;
let currentPDFFile = null;

// DOM要素
const elements = {
    dropzone: null,
    fileInput: null,
    convertBtn: null,
    clearBtn: null,
    pdfPreview: null,
    fileName: null,
    pageCount: null,
    fileSize: null,
    configPreview: null,
    loading: null,
    progressSection: null,
    progressFill: null,
    progressText: null,
    errorSection: null,
    errorText: null
};

/**
 * アプリケーション初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('アプリケーション起動');

    // DOM要素を取得
    initializeElements();

    // 設定ファイルを読み込み
    await loadConfig();

    // イベントリスナーを設定
    setupEventListeners();

    console.log('初期化完了');
});

/**
 * DOM要素を初期化
 */
function initializeElements() {
    elements.dropzone = document.getElementById('dropzone');
    elements.fileInput = document.getElementById('file-input');
    elements.convertBtn = document.getElementById('convert-btn');
    elements.clearBtn = document.getElementById('clear-btn');
    elements.pdfPreview = document.getElementById('pdf-preview');
    elements.fileName = document.getElementById('file-name');
    elements.pageCount = document.getElementById('page-count');
    elements.fileSize = document.getElementById('file-size');
    elements.configPreview = document.getElementById('config-preview');
    elements.loading = document.getElementById('loading');
    elements.progressSection = document.getElementById('progress-section');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressText = document.getElementById('progress-text');
    elements.errorSection = document.getElementById('error-section');
    elements.errorText = document.getElementById('error-text');
}

/**
 * 設定ファイルを読み込み
 */
async function loadConfig() {
    try {
        const response = await fetch('config.yml');
        const yamlText = await response.text();
        appConfig = jsyaml.load(yamlText);

        console.log('設定ファイル読み込み完了:', appConfig);

        // 設定プレビューを表示
        displayConfigPreview();

        // 変換コンバーターを初期化
        converter = new PDFToPPTXConverter(appConfig);
        setupConverterCallbacks();

    } catch (error) {
        console.error('設定ファイルの読み込みエラー:', error);
        showError('設定ファイルの読み込みに失敗しました。デフォルト設定を使用します。');

        // デフォルト設定を使用
        appConfig = getDefaultConfig();
        converter = new PDFToPPTXConverter(appConfig);
        setupConverterCallbacks();
    }
}

/**
 * 設定プレビューを表示
 */
function displayConfigPreview() {
    const html = `
        <div class="config-details">
            <div class="config-item">
                <strong>テンプレート</strong>
                ${appConfig.template.name}
            </div>
            <div class="config-item">
                <strong>プライマリカラー</strong>
                ${appConfig.design.theme.primary_color}
                <span class="color-preview" style="background-color: ${appConfig.design.theme.primary_color}"></span>
            </div>
            <div class="config-item">
                <strong>セカンダリカラー</strong>
                ${appConfig.design.theme.secondary_color}
                <span class="color-preview" style="background-color: ${appConfig.design.theme.secondary_color}"></span>
            </div>
            <div class="config-item">
                <strong>フォント</strong>
                ${appConfig.design.fonts.title.family}
            </div>
        </div>
    `;
    elements.configPreview.innerHTML = html;
}

/**
 * コンバーターのコールバックを設定
 */
function setupConverterCallbacks() {
    converter.setProgressCallback((progressData) => {
        updateProgress(progressData.message, progressData.progress);
    });

    converter.setErrorCallback((error) => {
        showError(error.message);
    });
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // ドラッグ&ドロップイベント
    elements.dropzone.addEventListener('dragover', handleDragOver);
    elements.dropzone.addEventListener('dragleave', handleDragLeave);
    elements.dropzone.addEventListener('drop', handleDrop);
    elements.dropzone.addEventListener('click', () => elements.fileInput.click());

    // ファイル選択イベント
    elements.fileInput.addEventListener('change', handleFileSelect);

    // 変換ボタン
    elements.convertBtn.addEventListener('click', handleConvert);

    // クリアボタン
    elements.clearBtn.addEventListener('click', handleClear);
}

/**
 * ドラッグオーバーハンドラー
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropzone.classList.add('drag-over');
}

/**
 * ドラッグリーブハンドラー
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropzone.classList.remove('drag-over');
}

/**
 * ドロップハンドラー
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropzone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * ファイル選択ハンドラー
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * ファイルを処理
 */
function handleFile(file) {
    // PDFファイルかチェック
    if (file.type !== 'application/pdf') {
        showError('PDFファイルのみアップロード可能です。');
        return;
    }

    currentPDFFile = file;

    // プレビューを表示
    displayPDFPreview(file);

    // 変換ボタンを有効化
    elements.convertBtn.disabled = false;

    // エラーをクリア
    hideError();
}

/**
 * PDFプレビューを表示
 */
function displayPDFPreview(file) {
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.pageCount.textContent = '読み込み中...';

    elements.pdfPreview.style.display = 'block';

    // ページ数を取得
    getPDFPageCount(file);
}

/**
 * PDFのページ数を取得
 */
async function getPDFPageCount(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        elements.pageCount.textContent = `${pdf.numPages} ページ`;
        pdf.destroy();
    } catch (error) {
        console.error('ページ数取得エラー:', error);
        elements.pageCount.textContent = '不明';
    }
}

/**
 * ファイルサイズをフォーマット
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 変換ボタンハンドラー
 */
async function handleConvert() {
    if (!currentPDFFile) {
        showError('PDFファイルを選択してください。');
        return;
    }

    // UIを変換中モードに
    setConvertingUI(true);
    hideError();

    try {
        // 変換実行
        await converter.convert(currentPDFFile);

        // 成功メッセージを表示
        console.log('変換完了！PowerPointがダウンロードされました。');

        // UIをリセット
        setTimeout(() => {
            setConvertingUI(false);
            handleClear();
        }, 2000);

    } catch (error) {
        console.error('変換失敗:', error);
        showError('変換に失敗しました: ' + error.message);
        setConvertingUI(false);
    }
}

/**
 * クリアボタンハンドラー
 */
function handleClear() {
    currentPDFFile = null;
    elements.fileInput.value = '';
    elements.pdfPreview.style.display = 'none';
    elements.convertBtn.disabled = true;
    elements.progressSection.style.display = 'none';
    hideError();
}

/**
 * 変換中UIを設定
 */
function setConvertingUI(isConverting) {
    if (isConverting) {
        elements.convertBtn.disabled = true;
        elements.clearBtn.disabled = true;
        elements.loading.style.display = 'block';
        elements.progressSection.style.display = 'block';
        elements.dropzone.style.pointerEvents = 'none';
    } else {
        elements.convertBtn.disabled = false;
        elements.clearBtn.disabled = false;
        elements.loading.style.display = 'none';
        elements.dropzone.style.pointerEvents = 'auto';
    }
}

/**
 * 進捗を更新
 */
function updateProgress(message, progress) {
    elements.progressFill.style.width = progress + '%';
    elements.progressText.textContent = message;
}

/**
 * エラーを表示
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorSection.style.display = 'block';
}

/**
 * エラーを非表示
 */
function hideError() {
    elements.errorSection.style.display = 'none';
}

/**
 * デフォルト設定を取得
 */
function getDefaultConfig() {
    return {
        template: {
            name: "Default Template"
        },
        design: {
            theme: {
                primary_color: "#2C5F2D",
                secondary_color: "#97BC62",
                background_color: "#FFFFFF"
            },
            fonts: {
                title: {
                    family: "Arial",
                    size: 32,
                    bold: true,
                    color: "#2C5F2D"
                },
                body: {
                    family: "Arial",
                    size: 18,
                    bold: false,
                    color: "#333333"
                }
            },
            layout: {
                slide_width: 10,
                slide_height: 7.5,
                margin: {
                    top: 0.5,
                    left: 0.5,
                    right: 0.5,
                    bottom: 0.5
                }
            }
        },
        conversion: {
            slide_templates: {
                title_slide: {
                    title: { x: 0.5, y: 2.5, width: 9.0, height: 1.5, align: "center", valign: "middle" },
                    subtitle: { x: 0.5, y: 4.2, width: 9.0, height: 0.8, align: "center", valign: "top" }
                },
                content_slide: {
                    title: { x: 0.5, y: 0.5, width: 9.0, height: 0.8, align: "left", valign: "middle" },
                    content: { x: 0.5, y: 1.5, width: 9.0, height: 5.5, align: "left", valign: "top" }
                }
            }
        },
        branding: {
            footer: {
                enabled: true,
                text: "FABRIC TOKYO",
                position: { x: 0.5, y: 7.0 },
                font_size: 10,
                color: "#97BC62"
            }
        }
    };
}
