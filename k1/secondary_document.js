function GetSheetName(){
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  }
  
  function setSheetName() {
    var mainSS = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = mainSS.getActiveSheet();
    var sheetName = activeSheet.getName();
    activeSheet.getRange("A1").setValue(sheetName);
  }