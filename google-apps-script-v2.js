/**
 * Google Apps Script for Research Notebook Backend (v2)
 * WITH FIREBASE AUTHENTICATION SUPPORT
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace ALL existing code with this code
 * 4. Save (Ctrl+S or Cmd+S)
 * 5. Deploy as a web app:
 *    - Click "Deploy" > "New deployment"
 *    - Click the gear icon next to "Select type" and choose "Web app"
 *    - Description: "Research Notebook API v2"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (required for proxy to work)
 * 6. Click "Deploy"
 * 7. Authorize the script if prompted
 * 8. Copy the web app URL to your .env file as GOOGLE_SHEET_DB_URL
 * 
 * Required Sheet Structure:
 * First row should contain these headers (in any order):
 * id, created_by, date, plan_to_read, plan_to_do, did_read, learned_today, 
 * new_thoughts, coded_today, wrote_or_taught, try_tomorrow, created_at, updated_at
 */

const SHEET_NAME = 'ResearchLogs'; // Change this to your sheet name if different

/**
 * Handle GET requests - Fetch all logs
 */
function doGet(e) {
  try {
    Logger.log('=== GET REQUEST ===');
    Logger.log('Parameters: ' + JSON.stringify(e.parameter));
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('ERROR: Sheet not found: ' + SHEET_NAME);
      return createJsonResponse({ 
        error: 'Sheet not found', 
        sheetName: SHEET_NAME,
        availableSheets: SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName())
      }, 404);
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      Logger.log('Sheet is empty, returning empty array');
      return createJsonResponse({ data: [] });
    }
    
    // First row is headers
    const headers = data[0];
    const rows = data.slice(1);
    
    Logger.log('Found ' + rows.length + ' rows');
    
    // Convert rows to objects
    const logs = rows
      .filter(row => row[0] && row[0].toString().trim() !== '') // Filter out empty rows
      .map(row => {
        const log = {};
        headers.forEach((header, index) => {
          log[header] = row[index] || '';
        });
        return log;
      });
    
    Logger.log('Returning ' + logs.length + ' logs');
    return createJsonResponse({ data: logs });
    
  } catch (error) {
    Logger.log('ERROR in doGet: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createJsonResponse({ 
      error: 'Failed to fetch logs',
      message: error.toString(),
      stack: error.stack
    }, 500);
  }
}

/**
 * Handle POST requests - Create new log, or handle update/delete actions
 */
function doPost(e) {
  try {
    Logger.log('=== POST REQUEST ===');
    Logger.log('Parameters: ' + JSON.stringify(e.parameter));
    Logger.log('Content length: ' + (e.postData ? e.postData.length : 0));
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('ERROR: Sheet not found: ' + SHEET_NAME);
      return createJsonResponse({ 
        error: 'Sheet not found', 
        sheetName: SHEET_NAME 
      }, 404);
    }
    
    // Check if this is an update or delete action
    const action = e.parameter.action;
    Logger.log('Action: ' + (action || 'create (default)'));
    
    if (action === 'update') {
      return handleUpdate(e, sheet);
    } else if (action === 'delete') {
      return handleDelete(e, sheet);
    }
    
    // Default: Create new log
    Logger.log('Creating new log...');
    
    if (!e.postData || !e.postData.contents) {
      Logger.log('ERROR: No post data provided');
      return createJsonResponse({ 
        error: 'No data provided',
        message: 'POST request must include JSON data in the body'
      }, 400);
    }
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed data: ' + JSON.stringify(data));
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Sheet headers: ' + JSON.stringify(headers));
    
    // Create row in the same order as headers
    const row = headers.map(header => {
      const value = data[header];
      return value !== undefined && value !== null ? value : '';
    });
    
    Logger.log('Appending row: ' + JSON.stringify(row));
    sheet.appendRow(row);
    
    Logger.log('Log created successfully');
    return createJsonResponse({ 
      success: true, 
      message: 'Log created successfully',
      data: data 
    });
    
  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return createJsonResponse({ 
      error: 'Failed to process request',
      message: error.toString(),
      stack: error.stack
    }, 500);
  }
}

/**
 * Handle update action (called from doPost with action=update)
 */
function handleUpdate(e, sheet) {
  try {
    Logger.log('=== UPDATE REQUEST ===');
    
    const id = e.parameter.id;
    if (!id) {
      Logger.log('ERROR: No ID provided');
      return createJsonResponse({ 
        error: 'ID parameter is required',
        message: 'Include ?id=<log_id> in the URL'
      }, 400);
    }
    
    Logger.log('Updating log with ID: ' + id);
    
    if (!e.postData || !e.postData.contents) {
      return createJsonResponse({ error: 'No data provided' }, 400);
    }
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Update data: ' + JSON.stringify(data));
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    
    // Find the row with matching id
    const idColumnIndex = headers.indexOf('id');
    if (idColumnIndex === -1) {
      Logger.log('ERROR: No "id" column found in sheet');
      return createJsonResponse({ error: 'Sheet configuration error: no "id" column' }, 500);
    }
    
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] && allData[i][idColumnIndex].toString() === id.toString()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log('ERROR: Log not found with ID: ' + id);
      return createJsonResponse({ error: 'Log not found', id: id }, 404);
    }
    
    Logger.log('Found log at row: ' + (rowIndex + 1));
    
    // Update the row
    let updatedCount = 0;
    headers.forEach((header, index) => {
      if (data[header] !== undefined && data[header] !== null) {
        sheet.getRange(rowIndex + 1, index + 1).setValue(data[header]);
        updatedCount++;
      }
    });
    
    Logger.log('Updated ' + updatedCount + ' fields');
    
    return createJsonResponse({ 
      success: true, 
      message: 'Log updated successfully',
      updatedFields: updatedCount,
      data: data 
    });
    
  } catch (error) {
    Logger.log('ERROR in handleUpdate: ' + error.toString());
    return createJsonResponse({ 
      error: 'Failed to update log',
      message: error.toString() 
    }, 500);
  }
}

/**
 * Handle delete action (called from doPost with action=delete)
 */
function handleDelete(e, sheet) {
  try {
    Logger.log('=== DELETE REQUEST ===');
    
    const id = e.parameter.id;
    if (!id) {
      Logger.log('ERROR: No ID provided');
      return createJsonResponse({ 
        error: 'ID parameter is required',
        message: 'Include ?id=<log_id> in the URL'
      }, 400);
    }
    
    Logger.log('Deleting log with ID: ' + id);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const allData = sheet.getDataRange().getValues();
    const idColumnIndex = headers.indexOf('id');
    
    if (idColumnIndex === -1) {
      return createJsonResponse({ error: 'Sheet configuration error: no "id" column' }, 500);
    }
    
    // Find the row with matching id
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] && allData[i][idColumnIndex].toString() === id.toString()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log('ERROR: Log not found with ID: ' + id);
      return createJsonResponse({ error: 'Log not found', id: id }, 404);
    }
    
    Logger.log('Found log at row: ' + (rowIndex + 1) + ', deleting...');
    
    // Delete the row
    sheet.deleteRow(rowIndex + 1);
    
    Logger.log('Log deleted successfully');
    
    return createJsonResponse({ 
      success: true, 
      message: 'Log deleted successfully',
      id: id
    });
    
  } catch (error) {
    Logger.log('ERROR in handleDelete: ' + error.toString());
    return createJsonResponse({ 
      error: 'Failed to delete log',
      message: error.toString() 
    }, 500);
  }
}

/**
 * Create standardized JSON response
 */
function createJsonResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Note: Google Apps Script doesn't support custom HTTP status codes
  // The statusCode parameter is kept for API consistency but won't affect the actual response
  // All responses will be HTTP 200, with error information in the JSON body
  
  return response;
}

/**
 * Test function - run this to verify your setup
 * Go to Extensions > Apps Script, click "Run" and select "testSetup"
 */
function testSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log('❌ ERROR: Sheet "' + SHEET_NAME + '" not found!');
    Logger.log('Available sheets: ' + SpreadsheetApp.getActiveSpreadsheet().getSheets().map(s => s.getName()).join(', '));
    return;
  }
  
  Logger.log('✅ Sheet found: ' + SHEET_NAME);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('✅ Headers: ' + headers.join(', '));
  
  const requiredHeaders = ['id', 'created_by', 'date', 'plan_to_read', 'plan_to_do', 'did_read', 
                           'learned_today', 'new_thoughts', 'coded_today', 'wrote_or_taught', 
                           'try_tomorrow', 'created_at', 'updated_at'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    Logger.log('⚠️  WARNING: Missing headers: ' + missingHeaders.join(', '));
  } else {
    Logger.log('✅ All required headers present');
  }
  
  const rowCount = sheet.getLastRow() - 1; // Subtract header row
  Logger.log('✅ Data rows: ' + rowCount);
  
  Logger.log('\n🎉 Setup looks good! Deploy this as a web app and copy the URL to your .env file.');
}

