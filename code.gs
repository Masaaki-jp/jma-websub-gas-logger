/**
 * 気象庁防災情報XML WebSub動的受信＆スプレッドシート記録スクリプト
 * * 【初期設定】
 * 1. 記録先のスプレッドシートを作成し、URLからIDを取得して SPREADSHEET_ID に設定してください。
 * 2. 対象のシート名を SHEET_NAME に設定してください（デフォルトは 'シート1'）。
 */

// ★記録先のスプレッドシートID（ご自身のスプレッドシートIDに変更してください）
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'シート1'; 

/**
 * 1. WebSubの購読確認用（GETリクエスト）
 * 気象庁（ハブ）からの購読確認リクエストに応答します。
 */
function doGet(e) {
  if (e && e.parameter && e.parameter['hub.challenge']) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  return ContentService.createTextOutput("Webhook is active.");
}

/**
 * 2. 気象庁からのプッシュ受信・処理用（POSTリクエスト）
 * 全国のデータをメモリ上で解析し、スプレッドシートへ直接書き込みます。
 */
function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput("No content");
  }

  try {
    const atomString = e.postData.contents;
    const document = XmlService.parse(atomString);
    const root = document.getRootElement();
    const atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
    const entries = root.getChildren('entry', atomNs);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    for (let i = 0; i < entries.length; i++) {
      const title = entries[i].getChild('title', atomNs).getText();
      const authorElement = entries[i].getChild('author', atomNs);
      
      // 発表元（例：横浜地方気象台、気象庁本庁など）を取得。スプレッドシートでのフィルタリングに使用可能。
      const authorName = authorElement ? authorElement.getChild('name', atomNs).getText() : "不明";
      
      // 対象情報のフィルタリング（気象警報・注意報、指定河川洪水予報のみを対象）
      if (title.includes('指定河川洪水予報') || title.includes('気象特別警報・警報・注意報')) {
        
        const link = entries[i].getChild('link', atomNs).getAttribute('href').getValue();
        
        // 詳細XMLをメモリ上に取得
        const xmlResponse = UrlFetchApp.fetch(link);
        const detailXmlString = xmlResponse.getContentText();
        
        // 詳細XMLをパースして、分かりやすい日本語の警告文（Headline -> Text）を抽出
        const detailDoc = XmlService.parse(detailXmlString);
        const detailRoot = detailDoc.getRootElement();
        const infoNs = XmlService.getNamespace('http://xml.kishou.go.jp/jmaxml1/informationBasis1/');
        
        let headlineText = "詳細なテキスト情報なし";
        const headElement = detailRoot.getChild('Head', infoNs);
        if (headElement) {
          const headlineElement = headElement.getChild('Headline', infoNs);
          if (headlineElement) {
            const textElement = headlineElement.getChild('Text', infoNs);
            if (textElement) {
              headlineText = textElement.getText();
            }
          }
        }
        
        // スプレッドシートの最終行に [取得日時, タイトル, 発表元, 警告文, URL] を追記
        const now = new Date();
        sheet.appendRow([now, title, authorName, headlineText, link]);
      }
    }
    return ContentService.createTextOutput("OK");
  } catch (error) {
    console.error("Error in doPost: " + error.message);
    return ContentService.createTextOutput("Error");
  }
}

/**
 * 3. 24時間経過した古いデータを削除する（定期実行用バッチ処理）
 * ※GASの「トリガー」設定から、この関数を定期実行（例: 1日1回、または数時間おき）するように設定してください。
 */
function deleteOldRecords() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const now = new Date().getTime();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24時間をミリ秒で定義

  // 行のズレを防ぐため、一番下の行から上に向かってチェックと削除を行う
  for (let i = data.length - 1; i >= 1; i--) { // i>=1 にすることで1行目(ヘッダー)は残す
    const rowDate = new Date(data[i][0]).getTime(); // A列の日時を取得
    
    // 日付が解読できない行や、24時間以上前の行を削除
    if (!rowDate || (now - rowDate > TWENTY_FOUR_HOURS)) {
      sheet.deleteRow(i + 1);
    }
  }
  console.log("古いデータのクリーニングが完了しました。");
}
