// utils/subscritpionTemplate.js (Full Updated Code)

const subscritpionTemplate = (title, content, buttonText = null, buttonLink = null, invoicePdfUrl = null) => {
  // Invoice Button (Green - Dark text)
  const invoiceButtonHTML = invoicePdfUrl ? `
    <tr>
      <td align="center" style="padding-top:30px; padding-bottom:20px;">
        <a 
          href="${invoicePdfUrl}" 
          target="_blank"
          style="
            display:inline-block; 
            padding:16px 36px; 
            background:linear-gradient(135deg, #10b981, #34d399); 
            color:#00000; 
            font-weight:bold; 
            font-size:17px; 
            text-decoration:none; 
            border-radius:50px;
            box-shadow:0 6px 20px rgba(16,185,129,0.3);
          "
        >
          📄 Download Your Invoice
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-bottom:30px; font-size:15px; color:#1f2937; font-weight:500;">
        This is your official tax invoice • Valid for reimbursement & records
      </td>
    </tr>
  ` : '';

  // Main Action Button (Purple - White text)
  const mainButtonHTML = buttonText && buttonLink ? `
    <tr>
      <td align="center" style="padding-top:20px;">
        <a 
          href="${buttonLink}" 
          target="_blank"
          style="
            display:inline-block; 
            padding:14px 32px; 
            background:linear-gradient(135deg, #6b46c1, #9f7aea); 
            color:#00000; 
            font-weight:bold; 
            font-size:16px; 
            text-decoration:none; 
            border-radius:50px;
            box-shadow:0 4px 15px rgba(107,70,193,0.3);
          "
        >
          ${buttonText}
        </a>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f9;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; margin:20px auto;">
          
          <!-- Header Image -->
          <tr>
            <td>
              <img 
                src="cid:header" 
                alt="Rule7Media Header" 
                style="width:100%; max-width:600px; height:auto; display:block; border-radius:12px 12px 0 0;" 
              />
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="background-color:#ffffff; padding:40px 30px; text-align:center;   12px 12px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="font-size:28px; color:#6b46c1; margin:0 0 20px 0; font-weight:bold;">
                      ${title}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:16px; line-height:1.7; color:#1f2937;">
                    ${content}
                  </td>
                </tr>

                <!-- Invoice Download Button + Text -->
                ${invoiceButtonHTML}

                <!-- Main Action Button -->
                ${mainButtonHTML}
              </table>
            </td>
          </tr>
          <!-- Footer Image -->
          <tr>
            <td>
              <img 
                src="cid:footer" 
                alt="Rule7Media Footer" 
                style="width:100%; max-width:600px; height:auto; display:block;" 
              />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export default subscritpionTemplate;