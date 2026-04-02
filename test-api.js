async function testApi() {
  const API_URL = 'https://script.google.com/macros/s/AKfycbz8EyfXodWUBBNsPsk3_F_TdmPHBsiMaTGpC5jGf9v7LhVSicvUEjLH9GOMukduyZ5qVg/exec';
  const body = JSON.stringify({ action: 'sync', playerId: 'test', token: 'test' });
  try {
    const res = await fetch(API_URL, { method: 'POST', body });
    const data = await res.json();
    console.log("== Questions returned from the Cloud Spreadsheet ==");
    console.log(data.questions);
  } catch (e) {
    console.log("Error:", e);
  }
}
testApi();
