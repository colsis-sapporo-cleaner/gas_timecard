
export class TimecardSheet {
  // 作成されるユーザ毎のシート名デフォルト値。%%user%% はユーザ名に変換され、%%date%%はYYYYMM に変換されます。
  private sheetNameFormat = '%%user%%_%%date%%';
  // 各シートのデフォルトヘッダ(1行目)
  private headers = ['日付', '出社時刻', '退社時刻', '休憩時間', 'リモート勤務？', '休暇？'];
  private prop;
  private book;
  private targetSheet;
  private usersSheet;
  private slackUsers;
  private kintoneUsers;
  private users;

  constructor () {
    this.prop = new Properties();
    this.book = SpreadsheetApp.openById(this.prop.sheetId);
    this.usersSheet = this.book.getSheetByName(this.prop.usersSheetName);
    this._parseUsers();
    if (!this.usersSheet) {
      throw new Error('userssheet not defined.');
    }
  }

  // ※スプレッドシートのタブ名をどうしたいかによって修正必要
  // @param user [string] ユーザ名
  // @param date [Moment] 対象日付Moment
  private _getSheetName (user, date) {
    let sheetName = this.sheetNameFormat;
    return sheetName
      .replace(/%%user%%/i, user)
      .replace(/%%date%%/i, date.format('YYYYMM'));
  }

  // ユーザ一覧シートを読み取ってなんかうまいことやる
  // userssheet のフォーマットが変わったら修正必要
  private _parseUsers () {
    const rows = this.usersSheet.getDataRange().getValues();
    const keys = rows.shift();
    this.slackUsers = rows.map((row) => { return row[0]; });
    this.kintoneUsers = rows.map((row) => { return row[1]; });
    this.users = this.slackUsers.map((slack, i) => { return {slackUser: this.slackUsers[i], kintoneUser: this.kintoneUsers[i]}; });
  }

  getUsers () { return this.users; }
  getSlackUsers () { return this.slackUsers; }
  getKintoneUsers () { return this.kintoneUsers; }

  // @param user [string] ユーザ名
  // @param date [Moment] 対象日付Momentインスタンス
  getTargetSheet (user, date) {
    const sheetName = this._getSheetName(user, date);
    this.targetSheet = this.book.getSheetByName(sheetName) || this._createNewSheet(sheetName);
    return this.targetSheet;
  }

  // @return [Spreadsheet]
  private _createNewSheet (sheetName: string) {
    const sheet = this.book.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, this.headers.length).setValues([this.headers]);
    return sheet;
  }

  setHeaders (headers) {
    this.headers = headers;
  }

  setSheetNameFormat (format) {
    this.sheetNameFormat = format;
  }

}
