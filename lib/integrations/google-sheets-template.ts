/**
 * Crescelo AI — Google Sheets Real-Time Sync Webhook
 * Standard copy-paste Google Apps Script template for client and server usage.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Crescelo AI — Google Sheets Real-Time Sync Webhook
 * 
 * Setup instructions:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Delete any existing code and paste this entire script.
 * 3. Click "Deploy" > "New deployment".
 * 4. Select type: "Web app".
 * 5. Configuration:
 *    - Description: Crescelo Lead & Booking Sync
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (required so Crescelo can post rows)
 * 6. Click "Deploy", authorize access, and copy the Web App URL.
 * 7. Paste the Web App URL into your Crescelo Assistant Channels settings.
 */
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000); // Wait up to 10s for concurrency safety
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create formatted headers if sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Event',
        'Assistant Name',
        'Customer Name',
        'Email Address',
        'Phone Number',
        'Service / Topic',
        'Appointment Date',
        'Appointment Time',
        'Duration',
        'Notes / Inquiry',
        'Source'
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#08251a');
      headerRange.setFontColor('#abff44');
      sheet.setFrozenRows(1);
    }
    
    var row = data.row || [
      data.timestamp || new Date().toISOString(),
      data.event || 'lead.created',
      data.assistantName || 'AI Assistant',
      data.customerName || '',
      data.customerEmail || '',
      data.customerPhone || '',
      data.service || '',
      data.appointmentDate || '',
      data.appointmentTime || '',
      data.duration || '',
      data.notes || '',
      data.source || ''
    ];
    
    sheet.appendRow(row);
    lock.releaseLock();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      rowNumber: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Crescelo Google Sheets Webhook is active and ready to receive POST requests.'
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
