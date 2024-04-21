function listSheetNames() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = spreadsheet.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      Logger.log(sheets[i].getName());
    }
  }
  
  function adjustDayNames() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var range = sheet.getRange("B2:AF2");
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
  
  
  function onEdit(e) {
    // Check if event object and source exist
    if (!e || !e.source) return;
  
    var editedSheet = e.source.getActiveSheet();
    var editedRange = e.range;
    var editedValue = editedRange.getValue();
    var editedRow = editedRange.getRow();
    var editedColumn = editedRange.getColumn();
  
    // Check if the edited value is "nn"
  if (editedValue === "nn" || editedValue === "NN" || editedValue === "Nn" || editedValue === "nN") {
      // Establish connection to the "swimmer_schedule" sheet
      var scheduleSheet = e.source.getSheetByName("swimmer_schedule");
      if (!scheduleSheet) return; // Stop execution if "swimmer_schedule" sheet doesn't exist
      
      // Find the corresponding cell in the "swimmer_schedule" sheet based on mainPerson and mainHeaderValue
      var mainPerson = editedSheet.getRange(editedRow, 1).getValue(); // Get the person's name from column A of the main sheet
      var mainHeaderValue = editedSheet.getRange(2, editedColumn).getValue(); // Get the header value from row 2 of the same column in the main sheet
      var schedulePerson = scheduleSheet.getRange("A:A").getValues().flat().indexOf(mainPerson) + 1; // Get the column index for mainPerson
      var scheduleHeader = scheduleSheet.getRange(1, 1, 1, scheduleSheet.getLastColumn()).getValues()[0].indexOf(mainHeaderValue) + 1; // Get the row index for mainHeaderValue
      
      // If both person and header exist, store the located cell in expectedAttendance
      if (schedulePerson !== -1 && scheduleHeader !== -1) {
        var expectedAttendance = scheduleSheet.getRange(schedulePerson, scheduleHeader).getValue();
        Logger.log("Expected attendance located at: " + expectedAttendance);
        editedRange.setValue(expectedAttendance);
        if (!expectedAttendance) return;
  
  
        // Check if the expected attendance is "n" and replace edited value accordingly
        if (expectedAttendance === "n" || expectedAttendance === "N") {
          editedRange.setValue(expectedAttendance);
        } else if (expectedAttendance === "a" || expectedAttendance === "A"){ 
          editedRange.setValue("NN");
        }
      } else {
        Logger.log("Expected attendance not found.");
      }
    }
  }
  
  function duplicateSheetWithPrompt() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Prompt the user for the new sheet name
    var newName = Browser.inputBox("Enter the name for the new sheet (month):");
    
    // Duplicate the current sheet
    var newSheet = sheet.copyTo(ss);
    
    // Rename the new sheet
    newSheet.setName(newName);
  }
  
  
  
  
  
  