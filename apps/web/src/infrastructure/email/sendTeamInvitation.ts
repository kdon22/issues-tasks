import { sendEmail } from './sendEmail'

interface TeamInvitationEmailProps {
  email: string
  teamName: string
  inviterName: string
  acceptUrl: string
}

export async function sendTeamInvitation({
  email,
  teamName,
  inviterName,
  acceptUrl
}: TeamInvitationEmailProps) {
  const html = `
    <!DOCTYPE html>
    <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Your existing styles */
      </style>
    </head>
    <body style="text-size-adjust: none; background-color: #f6f6f6; margin: 0; padding: 0;">
      <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6;">
        <tbody>
          <!-- Logo Section -->
          <tr>
            <td>
              <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fff; border-radius: 4px; width: 600px; margin: 0 auto;">
                <tbody>
                  <tr>
                    <td style="padding: 20px;">
                      <img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1009051_993912/Asset%206-8.png" style="height: auto; display: block; border: 0; max-width: 236px; width: 100%;">
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td>
              <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #fff; border-radius: 4px; width: 600px; margin: 20px auto;">
                <tbody>
                  <tr>
                    <td style="padding: 20px;">
                      <h3 style="margin: 0; color: #000000; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 18px; font-weight: 700;">
                        You have been invited to join the ${teamName} team
                      </h3>
                      <p style="margin-top: 15px; color: #101112; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px;">
                        ${inviterName} has invited you to collaborate on the ${teamName} team. You can start collaborating with your teammates when you accept the invite!
                      </p>
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${acceptUrl}" style="display: inline-block; padding: 10px 25px; background-color: #f96332; color: white; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif;">
                          Accept Invite
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Join ${teamName} on IssuesTasks`,
    html
  })
} 