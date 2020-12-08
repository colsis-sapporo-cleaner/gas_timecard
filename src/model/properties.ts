export class Properties {

  constructor () {
    this.sheetId              = this._getProperty('SHEET_ID');
    this.usersSheetName       = this._getProperty('USERS_SHEET_NAME');
    this.slackToken           = this._getProperty('SLACK_TOKEN');
    this.slackChannelId       = this._getProperty('SLACK_CHANNEL_ID');
    this.kintoneClientID      = this._getProperty('KINTONE_CLIENT_ID');
    this.kintoneClientSecret  = this._getProperty('KINTONE_CLIENT_SECRET');
    this.kintoneAuthCallback  = this._getProperty('KINTONE_AUTH_CALLBACK');
    this.kintoneSubDomain     = this._getProperty('KINTONE_SUB_DOMAIN');
    this.kintoneAppId         = this._getProperty('KINTONE_APP_ID');
  }
  
  _getProperty (name:string): string {
    if (!name) throw 'Property name not speciied.';
    return PropertiesService.getScriptProperties().getProperty(name);
  }

}
