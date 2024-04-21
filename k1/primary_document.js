function listSheetNames() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = spreadsheet.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      Logger.log(sheets[i].getName());
    }
  }
  
  function aproveLayout(){
    var mainSS = SpreadsheetApp.getActiveSpreadsheet();
    var mainSheet = mainSS.getActiveSheet();
    
     if (mainSheet.getName() === "template") {
      var response = Browser.msgBox("Warning", "You are editing in the TEMPLATE. Do you want to continue?", Browser.Buttons.YES_NO);
      if (response !== Browser.Buttons.YES) {
        Logger.log("Copying process cancelled.");
        return; 
      }
    }
    adjustDayNames();
    copyRangeToOtherDocument()
  }
  
  function adjustDayNames() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var range = sheet.getRange("B2:AM2");
    var values = range.getValues()[0];
  
  //  for (var i = 0; i < values.length; i++) {
  //    values[i] = values[i].replace(/e([A-Z])/g, '$1').replace(/m([A-Z])/g, '$1');
  //  }
  
    var prevDay = '';
    var consecutiveCount = 0;
    for (var i = 0; i < values.length; i++) {
      var day = values[i];
      if (day === prevDay) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
  
      if (consecutiveCount === 2) {
        // First consecutive occurrence
        values[i - 1] = 'm' + prevDay;
        values[i] = 'e' + day;
        sheet.getRange(range.getRow(), range.getColumn() + i - 1).setValue('m' + prevDay);
        sheet.getRange(range.getRow(), range.getColumn() + i).setValue('e' + day);
      } else if (consecutiveCount > 2) { // more than two consectuive days
        // Subsequent consecutive occurrences
        values[i] = 'Con-Day-'+consecutiveCount;
      }
  
      prevDay = day;
    }
  }
  
  function copyRangeToOtherDocument() {
      var mainSS = SpreadsheetApp.getActiveSpreadsheet();
    var mainSheet = mainSS.getActiveSheet();
    var sportsAcademySSID = "1Jb85q1J6Bnr2BeGMfUAGhJOP5TbKaStClVaDnXB1_NQ";
    var sportsAcademyTemplateName = "template";
    var startRow = 1;
    var startColumn = 2; // Column B
    var lastColumn = mainSheet.getLastColumn();
    var endRow = 28; // Limit the end row to 28
    
    // Find the last column with data in row 1
    var dataRange = mainSheet.getRange(1, startColumn, 1, lastColumn - startColumn + 1);
    var values = dataRange.getValues()[0];
    var endColumn = values.lastIndexOf("") + startColumn;
    
    // Copy the range from B1 to AF2
    var rangeToCopy = mainSheet.getRange(1, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
    var valuesToCopy = rangeToCopy.getValues();
  
    // Open the other document (Sports Academy spreadsheet)
    var sportsAcademySS = SpreadsheetApp.openById(sportsAcademySSID);
    var sportsAcademySheet = sportsAcademySS.getSheetByName(mainSheet.getName());
    
    // If the sheet doesn't exist in the Sports Academy spreadsheet, create a new one
    if (!sportsAcademySheet) {
      sportsAcademySheet = sportsAcademySS.insertSheet(mainSheet.getName());
    }
    
    // Clear existing content starting from column B and rows 3 to 28
    sportsAcademySheet.getRange(startRow, startColumn, endRow - startRow + 1, lastColumn - startColumn + 1).clear();
  
    // Paste the copied range into the other sheet, starting from row 1 and column 2
    sportsAcademySheet.getRange(startRow, startColumn, endRow - startRow + 1, valuesToCopy[0].length).setValues(valuesToCopy).setHorizontalAlignment("center");
  
  }
  
  function copyRowFromActiveSheetToSecondSheet(activeSheet, editedRow) {
    // Get the values of the edited row from the active sheet
    var rowValues = activeSheet.getRange(editedRow + ":" + editedRow).getValues()[0];
    
    // Open the second spreadsheet by its ID
    var secondSpreadsheetId = "1Jb85q1J6Bnr2BeGMfUAGhJOP5TbKaStClVaDnXB1_NQ"; // Replace with the ID of your second spreadsheet
    var secondSpreadsheet = SpreadsheetApp.openById(secondSpreadsheetId);
    
    // Get the "May" sheet from the second spreadsheet
    var targetSheet = secondSpreadsheet.getSheetByName("May");
    
    // Find the next available row in the target sheet
    var lastRow = targetSheet.getLastRow() + 1;
    
    // Set the values of the edited row in the next available row of the second sheet
    targetSheet.getRange(lastRow, 1, 1, rowValues.length).setValues([rowValues]);
  }
  
  
  function copyRowFromActiveSheetToSecondSheetWORKING(editedRow, sheetName, mainPerson) {
      var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var sourceSheet = activeSpreadsheet.getActiveSheet();
  
      // Get the values starting from column B in the edited row from the active sheet
      var lastColumn = sourceSheet.getLastColumn();
      var rowValues = sourceSheet.getRange(editedRow, 2, 1, lastColumn - 1).getValues(); // Starts from column B
  
      // Open the second spreadsheet by its ID
      var secondSpreadsheetId = "1Jb85q1J6Bnr2BeGMfUAGhJOP5TbKaStClVaDnXB1_NQ";
      var secondSpreadsheet = SpreadsheetApp.openById(secondSpreadsheetId);
  
      // Attempt to get the same-named sheet from the second spreadsheet
      var targetSheet = secondSpreadsheet.getSheetByName(sheetName);
      if (!targetSheet) {
          Logger.log("Sheet named '" + sheetName + "' does not exist in the second spreadsheet.");
          return; // Exit if the sheet does not exist
      }
  
      // Look for mainPerson in the target sheet to determine the target row
      var targetData = targetSheet.getRange("A:A").getValues(); // Assuming mainPerson is in column A of the target sheet
      var targetRow = -1;
      for (var i = 0; i < targetData.length; i++) {
          if (targetData[i][0] === mainPerson) {
              targetRow = i + 1; // +1 because array indices are 0-based and sheet rows are 1-based
              break;
          }
      }
  
      if (targetRow === -1) {
          Logger.log("Person '" + mainPerson + "' not found in the target sheet.");
          return; // Exit if mainPerson is not found
      }
  
      // Set the values starting from column B in the determined row in the target sheet
      targetSheet.getRange(targetRow, 2, 1, lastColumn - 1).setValues(rowValues); // Starts from column B
  }
  
  
  
  
  
  function onEdit(e) {
      if (!e || !e.range || !e.source) return; // Check if the event object, range, and source exist
  
      var editedSheet = e.source.getActiveSheet();
      var editedRange = e.range;
      var editedValue = editedRange.getValue();
      var editedRow = editedRange.getRow();
      var editedColumn = editedRange.getColumn();
      var sheetName = editedSheet.getName();
      //copyRowFromActiveSheetToSecondSheet(editedSheet, editedRow)
  
      var scheduleSheet = e.source.getSheetByName("swimmer_schedule");
      if (!scheduleSheet) return;
        var mainPerson = editedSheet.getRange(editedRow, 1).getValue();
        var mainHeaderValue = editedSheet.getRange(2, editedColumn).getValue();
        var schedulePerson = scheduleSheet.getRange("A:A").getValues().flat().indexOf(mainPerson) + 1;
        var scheduleHeader = scheduleSheet.getRange(1, 1, 1, scheduleSheet.getLastColumn()).getValues()[0].indexOf(mainHeaderValue) + 1;
        var isSchedulePersonSA = scheduleSheet.getRange(schedulePerson, 10).getValue(); // Assuming tick box is in column J (10th column)
  
      if (editedValue === "nn" || editedValue === "NN" || editedValue === "Nn" || editedValue === "nN") {
        if (schedulePerson > 0 && scheduleHeader > 0) {
          var expectedAttendance = scheduleSheet.getRange(schedulePerson, scheduleHeader).getValue();
          if (expectedAttendance === "n" || expectedAttendance === "N") {
            editedRange.setValue("N");
          } else if (expectedAttendance === "a" || expectedAttendance === "A") {
            editedRange.setValue("NN");
          }
        }
  
        // Call the function to copy row from the active sheet to the second sheet
      }
      if(isSchedulePersonSA){
        copyRowFromActiveSheetToSecondSheetWORKING(editedRow, sheetName, mainPerson);
      }
  }
  
  
  
  function duplicateSheetWithPrompt() {
    var mainSS = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = mainSS.getActiveSheet();
    var sportsAcademySSID = "1Jb85q1J6Bnr2BeGMfUAGhJOP5TbKaStClVaDnXB1_NQ";
    var sportsAcademyTemplateName = "template";
  
    // Prompt the user for the new sheet name
    var newName = Browser.inputBox("Enter the name for the new sheet (month):");
    
    // Duplicate the MainSheet
   // NOT WORKING  updateDropdownValue(mainSS)
    var newSheet = sheet.copyTo(mainSS);
    newSheet.setName(newName);
  
    // Duplicate to Sports Acadamy Attendance sheet
    var sportsAcademySS = SpreadsheetApp.openById(sportsAcademySSID);
    var sportsAcademyTemplateSS = sportsAcademySS.getSheetByName(sportsAcademyTemplateName);
  
    var newSASheet = sportsAcademyTemplateSS.copyTo(sportsAcademySS)
    newSASheet.setName(newName);
    //add at line 105 after .protect()
  }
  
  
  function updateSASwimmers() {
    var mainSS = SpreadsheetApp.getActiveSpreadsheet();
    var scheduleSheet = mainSS.getSheetByName("swimmer_schedule");
    var sportsAcademySSID = "1Jb85q1J6Bnr2BeGMfUAGhJOP5TbKaStClVaDnXB1_NQ";
    var sportsAcademyTemplateName = "template";
    
    // Get the range of tick boxes in column J from J3 to J28
    var tickBoxRange = scheduleSheet.getRange("J3:J28");
    
    // Get the values of the tick boxes
    var tickBoxValues = tickBoxRange.getValues();
    
    // Open the template sheet in the second spreadsheet file
    var templateSASS = SpreadsheetApp.openById(sportsAcademySSID);
    var templateSheet = templateSASS.getSheetByName(sportsAcademyTemplateName);
    
    // Clear existing names in the template sheet (assuming employee names are in A3:A28)
    templateSheet.getRange("A3:A28").clearContent();
    
    var rowIndex = 3;
    
    // Loop through each tick box value and copy corresponding name if tick box is true
    for (var i = 0; i < tickBoxValues.length; i++) {
      if (tickBoxValues[i][0] === true) { // Check if tick box is true
        var employeeName = scheduleSheet.getRange("A" + (i + 3)).getValue(); // Get name from column A in "Schedule" sheet
        templateSheet.getRange("A" + rowIndex).setValue(employeeName); // Set name in template sheet
        rowIndex++; // Increment row index for next employee name
      }
    }
  }
  
  
  
  