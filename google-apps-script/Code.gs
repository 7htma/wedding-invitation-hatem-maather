const SHEET_NAME = 'RSVP';
const HEADERS = ['timestamp', 'name', 'phone', 'attendance', 'guestsCount', 'message', 'userAgent'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function output_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getSheet_();
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(body);
    const row = HEADERS.map(function (key) {
      if (key === 'timestamp') return data.timestamp || new Date().toISOString();
      return data[key] || '';
    });
    sheet.appendRow(row);
    return output_({ ok: true });
  } catch (err) {
    return output_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return output_({ entries: [] });
    const headers = values[0];
    const entries = values.slice(1).map(function (row) {
      const item = {};
      headers.forEach(function (header, i) { item[header] = row[i]; });
      return item;
    }).reverse();
    return output_({ entries: entries });
  } catch (err) {
    return output_({ entries: [], error: String(err) });
  }
}
