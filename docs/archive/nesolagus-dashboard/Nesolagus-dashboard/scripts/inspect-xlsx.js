const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/ghac-survey-export.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`Total rows: ${data.length}`);

  if (data.length > 0) {
    console.log('\n=== Column Names (first 30) ===');
    const headers = Object.keys(data[0]).slice(0, 30);
    headers.forEach((h, idx) => {
      console.log(`${idx}: ${h}`);
    });

    // Look for donation-related columns
    console.log('\n=== Looking for donation columns ===');
    const allHeaders = Object.keys(data[0]);
    const donationHeaders = allHeaders.filter(h =>
      h.toLowerCase().includes('donat') ||
      h.toLowerCase().includes('gift') ||
      h.toLowerCase().includes('$') ||
      h.toLowerCase().includes('amount') ||
      h.toLowerCase().includes('engaged or donated')
    );
    console.log('Donation-related columns:', donationHeaders);

    // Show sample donation values
    if (donationHeaders.length > 0) {
      console.log('\n=== Sample donation values ===');
      data.slice(0, 10).forEach((row, idx) => {
        donationHeaders.forEach(col => {
          if (row[col]) {
            console.log(`Row ${idx}, ${col}: ${row[col]}`);
          }
        });
      });
    }
  }
});
