GitHubのリポジトリにそのままコピー＆ペーストして使える形式で README.md を作成しました。前半を日本語、後半を英語で構成し、IT教育やビジネス実務への活用を意識したプロフェッショナルな構成にしています。

JMA WebSub GAS Logger
気象庁の防災情報XMLをWebSub経由で受信し、Googleスプレッドシートに記録するスクリプト。
A Google Apps Script to receive JMA weather alerts via WebSub and log them into a Google Spreadsheet.

日本語版 (Japanese)
概要
本プロジェクトは、気象庁が配信する「防災情報XML」をリアルタイムでプッシュ受信し、Googleスプレッドシートへ自動的に集約・記録する Google Apps Script (GAS) です。

主に「気象特別警報・警報・注意報」および「指定河川洪水予報」を対象としています。XMLの複雑な構造をパースし、実務で使いやすい形式（日時、タイトル、発表元、内容、URL）に整理して保存します。

主な機能
WebSub (Pub/Subhubbub) 対応: 気象庁からの通知をリアルタイムに受信。

XMLパース: 専門的なXMLから、分かりやすい日本語の警告テキストを抽出。

自動クリーンアップ: 24時間経過した古いデータを自動的に削除し、シートの肥大化を防止。

全国対応: 地域を限定せず、全国の情報を一括で収集可能。

セットアップ
スプレッドシートの準備:

新規スプレッドシートを作成し、IDをメモしてください。

シート名を シート1 にするか、コード内の SHEET_NAME を書き換えてください。

GASのデプロイ:

code.gs をGASエディタに貼り付け、SPREADSHEET_ID をご自身のものに書き換えます。

「デプロイ」>「新しいデプロイ」から「ウェブアプリ」を選択。

アクセスできるユーザーを「全員（Anyone）」に設定してデプロイし、発行された ウェブアプリURL をコピーします。

WebSubの登録:

気象庁のWebSubハブ（例: 気象庁防災情報XML配信サービス）へ、上記URLをコールバックとして登録します。

トリガー設定:

deleteOldRecords 関数を「時間主導型」トリガー（例：1日1回）で実行するように設定してください。

English Version (English)
Overview
This project is a Google Apps Script (GAS) that receives "Disaster Prevention XML" delivered by the Japan Meteorological Agency (JMA) in real-time via WebSub and automatically logs it into a Google Spreadsheet.

It focuses on "Weather Warnings/Advisories" and "Designated River Flood Forecasts." It parses the complex XML structure and organizes the data into a practical format (Timestamp, Title, Author, Headline, and URL).

Features
WebSub (Pub/Subhubbub) Support: Real-time push notifications from the JMA.

XML Parsing: Extracts human-readable warning text from technical XML data.

Automatic Cleanup: Automatically deletes records older than 24 hours to keep the spreadsheet size manageable.

Nationwide Coverage: Captures data from all regions across Japan.

Setup
Prepare Spreadsheet:

Create a new Google Spreadsheet and copy its ID.

Set the sheet name to Sheet1 (or your preferred name and update SHEET_NAME in the script).

Deploy GAS:

Paste code.gs into the GAS editor and replace SPREADSHEET_ID with your ID.

Click "Deploy" > "New Deployment" and select "Web App."

Set "Who has access" to "Anyone" and copy the generated Web App URL.

Register WebSub:

Register the Web App URL as the callback URL on the JMA WebSub hub.

Trigger Setting:

Set up a "Time-driven" trigger for the deleteOldRecords function (e.g., once a day).
