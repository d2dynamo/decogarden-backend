import sgMail from "@sendgrid/mail";

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

  public async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicData: object,
    from = "noreply@durnehviir.com"
  ): Promise<void> {
    const msg = {
      to,
      from,
      templateId,
      dynamicTemplateData: dynamicData,
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
