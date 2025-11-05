/**
 * Google Apps Script for Research Notebook Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the content with this code
 * 4. Deploy as a web app (Deploy > New deployment)
 * 5. Set "Who has access" to "Anyone"
 * 6. Copy the web app URL to your .env file as GOOGLE_SHEET_DB_URL
 * 
 * Required Sheet Structure:
 * First row should contain these headers (in any order):
 * id, created_by, date, plan_to_read, plan_to_do, did_read, learned_today, 
 * new_thoughts, coded_today, wrote_or_taught, try_tomorrow, created_at, updated_at
 */

const SHEET_NAME = 'ResearchLogs'; // Change this to your sheet name

/**
 * Handle GET requests - Fetch all logs
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' }, 404);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return createResponse({ data: [] });
    }
    
    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convert rows to objects
    const logs = rows.map(row => {
      const log = {};
      headers.forEach((header, index) => {
        log[header] = row[index] || '';
      });
      return log;
    });
    
    return createResponse({ data: logs });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST requests - Create new log, or handle update/delete actions
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' }, 404);
    }
    
    // Check if this is an update or delete action
    const action = e.parameter.action;
    
    if (action === 'update') {
      return handleUpdate(e, sheet);
    } else if (action === 'delete') {
      return handleDelete(e, sheet);
    }
    
    // Default: Create new log
    const data = JSON.parse(e.postData.contents);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create row in the same order as headers
    const row = headers.map(header => data[header] || '');
    
    sheet.appendRow(row);
    
    return createResponse({ 
      success: true, 
      message: 'Log created successfully',
      data: data 
    });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle update action (called from doPost with action=update)
 */
function handleUpdate(e, sheet) {
  try {
    const id = e.parameter.id;
    if (!id) {
      return createResponse({ error: 'ID parameter is required' }, 400);
    }
    
    const data = JSON.parse(e.postData.contents);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    
    // Find the row with matching id
    const idColumnIndex = headers.indexOf('id');
    let rowIndex = -1;
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] === id) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse({ error: 'Log not found' }, 404);
    }
    
    // Update the row
    headers.forEach((header, index) => {
      if (data[header] !== undefined && data[header] !== null) {
        sheet.getRange(rowIndex + 1, index + 1).setValue(data[header]);
      }
    });
    
    return createResponse({ 
      success: true, 
      message: 'Log updated successfully',
      data: data 
    });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle delete action (called from doPost with action=delete)
 */
function handleDelete(e, sheet) {
  try {
    const id = e.parameter.id;
    if (!id) {
      return createResponse({ error: 'ID parameter is required' }, 400);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    const idColumnIndex = headers.indexOf('id');
    
    // Find the row with matching id
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] === id) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return createResponse({ error: 'Log not found' }, 404);
    }
    
    // Delete the row
    sheet.deleteRow(rowIndex + 1);
    
    return createResponse({ 
      success: true, 
      message: 'Log deleted successfully' 
    });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Create standardized JSON response
 */
function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Note: We no longer need doPut and doDelete functions
 * All operations now go through doPost with action parameters:
 * - No action parameter = Create
 * - action=update = Update
 * - action=delete = Delete
 */

