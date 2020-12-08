// require OAuth2 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
// require Moment MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48
// require Underscore M3i7wmUA_5n0NSEaa6NnNqOBao7QLBR4j

const _ = Underscore.load();

export class Kintone {
  private prop; 
  private auth; // OAuth2
  private API_BASE_DOMAIN = 'cybozu.com';
  private API_URI;
  private vacationsCache;

  constructor () {
    this.prop = new Properties();
    this.API_URI = `https://${this.prop.kintoneSubDomain}.${this.API_BASE_DOMAIN}`;

    this.auth = OAuth2.createService('kintone')
      .setAuthorizationBaseUrl(`${this.API_URI}/oauth2/authorization`)
      .setTokenUrl(`${this.API_URI}/oauth2/token`)
      .setClientId(this.prop.kintoneClientID)
      .setClientSecret(this.prop.kintoneClientSecret)
      .setCallbackFunction(this.prop.kintoneAuthCallback)
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('k:app_record:read');
    return this;
  }

  // kintone 休暇申請Appに問い合わせて今日の申請を得る。
  // @memo: subtable 内のレコードは = で検索することができない
  // @memo: TODAY() 関数はなんだかうまく使えなかった。KintoneSDKの実装なのかな。他の方法でなんとかなったのであまりしらべてない。
  getVacationsOfToday () {
    if (this.vacationsCache) {
      return this.vacationsCache;
    }
    const today = Moment.moment().format("YYYY-MM-DD");
    let queryParam = {
      app: this.prop.kintoneAppId,
      query: `日付 >= "${today}" and 日付_1 <= "${today}"`,
    };
    const query = _(queryParam).map((v, k) => { return `${k}=${v}`; }).join('&');
    const appUrl = encodeURI(`${this.API_URI}/k/v1/records.json?${query}`);
    const headers = { headers: { Authorization: `Bearer ${this.auth.getAccessToken()}`, }, };
    let response;
    try {
      response = UrlFetchApp.fetch(appUrl, headers);
    } catch (e) {
      console.log(e);
    }
    const result = JSON.parse(response.getContentText());
    this.vacationsCache = result.records;
    return result.records;
  }

  searchUserVacations (user: string) {
    if (!this.vacationsCache) {
      this.getVacationsOfToday();
    }

    return _(this.vacationsCache).find((record) => {
      if (record['作成者']) {
        if (record['作成者'].type == 'CREATOR') {
          if (record['作成者'].value.code == user) {
            return true;
          }
        }
      }
      return false;
    });
    
  }

}
