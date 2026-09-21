/**
 * Shree Krishna EduTech - Registration Sheet Receiver
 *
 * Create a Google Sheet with a tab named: Registrations
 * Then Extensions -> Apps Script and paste this code.
 * Deploy as Web app: Execute as Me, Who has access: Anyone.
 */

const SHEET_NAME = 'Registrations';

function doGet() {
  return ContentService
    .createTextOutput('Shree Krishna EduTech registration receiver is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`Sheet '${SHEET_NAME}' not found.`);
    }

    let data = {};
    const raw = e && e.postData && e.postData.contents
      ? e.postData.contents
      : '';

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    sheet.appendRow([
      new Date(),
      data.studentId || '',
      data.source || 'Website Registration',
      data.name || '',
      data.phone || '',
      data.email || '',
      data.dob || '',
      data.gender || '',
      data.program || '',
      data.courseType || '',
      data.timing || '',
      data.institution || '',
      data.source || '',
      data.message || '',
      data.registeredAt || '',
      data.status || 'New'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Registration saved.'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
