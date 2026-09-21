async function pushRegistrationToGoogleSheet(data) {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!url) {
    return { sent: false, skipped: true };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'Website Registration',
      ...data
    })
  });

  return {
    sent: response.ok,
    skipped: false,
    status: response.status
  };
}

module.exports = { pushRegistrationToGoogleSheet };
