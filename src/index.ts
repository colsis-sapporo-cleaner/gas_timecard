//import { prop } from './model/properties';
//import { slack } from './model/slack';
//import { kintone } from './model/kintone';
//import { TimecardSheet } from './model/TimecardSheet';

const _ = Underscore.load();


function main () {
  const prop = new Properties();
  const slack = new Slack(prop.slackToken, prop.slackChannelId);
  const timecard = new TimecardSheet();

  const memberStatuses = slack.memberStatuses;
  const users = timecard.getUsers();
  const targetDate = Moment.moment().subtract(1, 'days');
  const kintone = new Kintone();

  _(users).forEach((user) => {
    if (!user || !user.slackUser) return;

    const sheet = timecard.getTargetSheet(user.slackUser, targetDate);

    if (!_(memberStatuses).keys().some(() => { return user.slackUser })) return;

    const sorted = _(memberStatuses[user.slackUser]).sortBy('ts');
    const works = _(sorted).where({status: 'work'});
    const leaves = _(sorted).where({status: 'leave'});
    // 休憩はタイムスタンプではなく合計時間を算出
    let breaktime = Moment.moment.duration({});
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].status != 'break') continue;
      const start = Moment.moment(sorted[i].ts, 'HH:mm');
      // 休憩 -> 休憩ということはないはず。どうなったかは知らないが休憩は次のステータス変更まででおわり。
      if (sorted[i + 1]) {
        const end = Moment.moment(sorted[i + 1].ts, 'HH:mm');
        // 加算する
        breaktime.add(end.diff(start));
      }
    }

    let userVacation;
    if (kintone.auth.hasAccess()) {
      userVacation = kintone.searchUserVacations(user.kintoneUser);
    }

    const datas = [
      targetDate.format('YYYY/MM/DD'),
      // 仕事中ステータスに複数回なっている場合は最初の時間を採用する
      works[0] ? works[0].ts: '',
      // 退社ステータスが複数回ある場合は最後の時間を採用する。
      leaves.length ? leaves[leaves.length - 1].ts: '',
      // 休憩
      msToTime(breaktime.as('milliseconds')) || '00:00',
      // 最初の仕事中ステータスへの変化がリモートであればリモート。間違った場合は・・・どうしようもない。
      works[0] ? (works[0].remote ? '○': ''): '',
      // kintoneで申請あれば休暇
      userVacation ? '○': '',
    ];

    const row = sheet.getDataRange().getNumRows() + 1;
    sheet.getRange(row, 1, 1, datas.length).setValues([datas]);
    if (targetDate.format('d') == 0 || targetDate.format('d') == 6) {
      sheet.getRange(row, 1, 1, 1).setBackground('#F00');
    }

  });
}


function msToTime (s) {
  if (s == 0) return 0;
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  return (hrs < 10 ? '0' + hrs: hrs) + ':' + (mins < 10 ? '0' + mins: mins);
}


// kintone OAuth 用WebApp関数。WebappはdoGet以外の名称が許されていないのでここがスクリプト起点となる
function doGet () {
  'use strict';
  var kintone = new Kintone();
  if (kintone.auth.hasAccess()) {
    return HtmlService.createHtmlOutput('Success');
  }
  const authorizationUrl = kintone.auth.getAuthorizationUrl();
  const template = `<a href="${authorizationUrl}" target="_blank">Authorize</a>`;
  return HtmlService.createHtmlOutput(template);
}

// kintone OAuth 用 callback
function authCallback (request) {
  'use strict';
  const kintone = new Kintone();
  const authorized = kintone.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  }
  return HtmlService.createHtmlOutput('Denied');
}

