import sgMail from '@sendgrid/mail';
import type { TemplateDataMap } from './templates';
import logger from '../logger';

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
        from ?? (process.env.SENDGRID_FROM_EMAIL || 'noreply@durnehviir.com'),
      templateId,
      dynamicTemplateData: dynamicData || {},
    };

    try {
      await sgMail.send(msg);
    } catch (error: any) {
      logger.error(3, 'Error sending email:', {
        to,
        body: error.response?.body,
        error,
      });
      throw new Error('Failed to send email');
    }
  }
}

export default SgMailer;
