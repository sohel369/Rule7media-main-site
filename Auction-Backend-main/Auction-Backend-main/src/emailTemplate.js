 const getEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background: #fff;">
        <!-- Header Image -->
        <tr>
          <td style="padding: 0; margin: 0; text-align: center;">
            <img src="cid:header" alt="Header" style="width: 100%; max-width: 600px; display: block;">
          </td>
        </tr>
        <!-- Dynamic Email Content -->
        <tr>
          <td style="padding: 40px 20px; text-align: center;">
            <h2 style="color: #0056b3; margin-bottom: 20px;">${title}</h2>
            ${content}
          </td>
        </tr>
        <!-- Footer Image -->
        <tr>
          <td style="padding: 0; margin: 0; text-align: center;">
            <img src="cid:footer" alt="Footer" style="width: 100%; max-width: 600px; display: block;">
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
export default getEmailTemplate