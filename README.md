# gas_timecard

Slackの特定の「勤務状況投稿チャンネル」の投稿を元に、GoogleSpreadsheetに勤務表を作成する為のGAS。
kintone の特定Appから休暇申請を拾ってきておやすみ情報を付加したりもする。

各種設定はGAS側のプロパティで設定します。

## つかいかた

### clasp インストール

```
yarn global add @google/clasp
```

### gasへのpush

```
clasp push
```

### 必須プロパティ値

- SHEET_ID
  - 勤務表のSpreadsheetのIDを指定する
- USERS_SHEET_NAME
  - 勤務表Spreadsheet内の、勤務表作成対象ユーザIDを書くためのシートの名前（タブ名）を指定する
- SLACK_TOKEN
  - SLACKのTOKEN
- SLACK_CHANNEL_ID
  - SLACKの出勤状況ステータス用チャンネルのチャンネルID
- KINTONE_CLIENT_ID
  - KintoneのClientID
- KINTONE_CLIENT_SECRET
  - KintoneのClient Secret
- KINTONE_AUTH_CALLBACK
  - Kintone OAuth2 での認証コールバック関数名(index.ts内のauthCallback)
- KINTONE_SUB_DOMAIN
  - Kintone契約サブドメイン
- KINTONE_APP_ID
  - Kintoneでの休暇申請を管理しているAppのID

# ご注意

弊社での使い方しか想定していないので特に汎用的なものではないです。
ご利用いただくのは全く構いませんが、修正が前提となる事にご注意ください。

TypeScriptではあるものの、ESの書き方を一部で使いたかったというだけで、型とかは基本考慮していません。
tslint とか prettier とかも特にかけていません。気になる方は自前でどうぞ。

pull-reqはお待ちしています。
