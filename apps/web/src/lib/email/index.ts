import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'noreply@issuestasks.com'

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your email',
    html: `
      <h1>Welcome to IssuesTasks!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  })
}

export async function sendWorkspaceInviteEmail(email: string, inviterName: string, workspaceName: string, token: string) {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/workspace/accept-invite?token=${token}`
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Join ${workspaceName} on IssuesTasks`,
    html: `
      <h1>You've been invited!</h1>
      <p>${inviterName} has invited you to join ${workspaceName} on IssuesTasks.</p>
      <a href="${acceptUrl}">Accept Invitation</a>
    `
  })
} 