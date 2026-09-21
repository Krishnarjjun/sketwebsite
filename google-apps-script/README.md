GOOGLE SHEETS SETUP

1. Create a Google Sheet.
2. Rename the first tab to: Registrations
3. Put these headers in row 1:

Timestamp | Student ID | Source | Name | Phone | Email | DOB | Gender | Program | Course Type | Batch Timing | Institution | How Heard | Message | Registered At | Status

4. Open Extensions -> Apps Script.
5. Paste Code.gs.
6. Deploy -> New deployment -> Web app.
7. Execute as: Me
8. Who has access: Anyone
9. Copy the Web App URL.
10. Put that URL into backend/.env as GOOGLE_APPS_SCRIPT_URL.

Do not place the Google Apps Script URL secret or any MSG91 auth key inside frontend HTML.
