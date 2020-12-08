const SLACK_URI: string = 'https://slack.com/api/';

export class Slack {
  private token: string;
  private channel: string;
  private rawMessages;
  private memberStatuses;

  constructor (accessToken: string, channelID: string) {
    this.token = accessToken;
    this.channel = channelID;

    this.rawMessages = this.getChannelHistoryOfYesterday();
    this.memberStatuses = this.parseMemberStatuses();
  }

  getChannelHistoryOfYesterday (): any {
    const params:string = this.generateGETParameters({
      token: this.token,
      channel: this.channel,
      count: 1000,
      inclusive: true,
      latest: '' + Moment.moment().startOf('day').unix(),
      oldest: '' + Moment.moment().subtract(1, 'days').startOf('day').unix()
    });
    const url = `${SLACK_URI}conversations.history?${params}`;
    const resultRaw = UrlFetchApp.fetch(url);
    const result = JSON.parse(resultRaw);
    if (!result || !result.ok) throw "slack api connection failed.";

    return result.messages;
  }

  generateGETParameters (params: object): string {
    let results = [];
    Object.keys(params).forEach((k) => { results.push([k, params[k]].join('=')); });
    return results.join('&');
  }

  parseMemberStatuses () {
    let parsed = _(this.rawMessages).reverse().map((message) => {
      const raw = this.getRawStatusFromSlackMessage(message.text);
      return {
        ts: Moment.moment(message.ts, 'X').format('HH:mm'),
        user: this.getUsernameFromSlackMessage(message.text),
        status: this.getStatusFromSlackMessage(raw),
        remote: this.getRemoteStatusFromSlackMessage(raw),
      };
    });
    return _(parsed).groupBy('user');
  }


  // slackステータスメッセージのmatcher。あるワードを見つけたらこのステータス名に変換するみたいなのを書く
  // ※Slackにbotで投稿しているメッセージの形式によって修正必要
  getStatusFromSlackMessage (message) {
    return (
      /空/.test(message) ? 'leave':
      /仕事中/.test(message) ? 'work':
      /離席/.test(message) ? 'break': ''
    );
  }

  // slackステータスメッセージからリモートステータスを得る為のmatcher
  // ※Slackにbotで投稿しているメッセージの形式によって修正必要
  getRemoteStatusFromSlackMessage (message) {
    return /リモート/.test(message);
  }

  // slackステータスメッセージからユーザ名を得る
  // ※Slackにbotで投稿しているメッセージの形式によって修正必要
  getUsernameFromSlackMessage (message) {
    return message.substring(0, message.indexOf('の'));
  }

  // humanizeされたslackステータスメッセージからステータス関連部分だけを抜き出す
  // ※Slackにbotで投稿しているメッセージの形式によって修正必要
  getRawStatusFromSlackMessage (message) {
    return message.substring(message.indexOf('が') + 1, message.indexOf('に'));
  }

}
