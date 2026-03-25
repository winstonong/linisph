import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Pindo <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Pindo!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 8px;">Welcome to Pindo!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hey ${name},
        </p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          You're all set! You can now post tasks and get offers from trusted local taskers in Manila.
        </p>
        <a href="https://linisph.vercel.app/post-task" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          Post your first task
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
          — The Pindo Team
        </p>
      </div>
    `,
  });
}

export async function sendTaskPostedEmail(
  to: string,
  name: string,
  taskTitle: string,
  taskId: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your task "${taskTitle}" is live!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 8px;">Task posted!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hey ${name}, your task <strong>"${taskTitle}"</strong> is now live. Local taskers will start sending you offers soon.
        </p>
        <a href="https://linisph.vercel.app/tasks/${taskId}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          View your task
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
          We'll notify you when someone makes an offer.
        </p>
        <p style="color: #9ca3af; font-size: 13px;">
          — The Pindo Team
        </p>
      </div>
    `,
  });
}

export async function sendNewOfferEmail(
  to: string,
  customerName: string,
  taskerName: string,
  taskTitle: string,
  taskId: string,
  offerAmount: number
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `New offer on "${taskTitle}"`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 8px;">You have a new offer!</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hey ${customerName}, <strong>${taskerName}</strong> offered <strong>₱${offerAmount.toLocaleString()}</strong> for your task <strong>"${taskTitle}"</strong>.
        </p>
        <a href="https://linisph.vercel.app/tasks/${taskId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          View offer
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
          — The Pindo Team
        </p>
      </div>
    `,
  });
}
