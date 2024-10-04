import sgMail from "@sendgrid/mail";
import type { TemplateDataMap } from "./templates";

enum SendgridTemplates {
  "verifyEmail" = "d-7c3ad0b0dbfe420eb28623ffe29ddc3e",
}

interface verifyEmailData {
  verification_code: string;
}

class SgMailer {
  private static instance: SgMailer;

  private constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  public static getInstance(): SgMailer {
    if (!SgMailer.instance) {
      SgMailer.instance = new SgMailer();
    }
    return SgMailer.instance;
  }

  public async sendTemplateEmail<T extends keyof TemplateDataMap>(
    to: string,
    templateId: string,
    dynamicData?: TemplateDataMap[T],
    from?: string
  ): Promise<void> {
    const msg = {
      to,
      from:
        from ?? (process.env.SENDGRID_FROM_EMAIL || "noreply@durnehviir.com"),
      templateId,
      dynamicTemplateData: dynamicData || {},
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error: any) {
      console.log("Error sending email:", error.response?.body || error);
      throw new Error("Failed to send email");
    }
  }
}

export default SgMailer;
