import sgMailer from "./sgmail";
import { SendgridTemplates as templates } from "./templates";
import type { verifyEmailData, TemplateDataMap } from "./templates";

export default sgMailer;

export { templates };
export type { verifyEmailData, TemplateDataMap };
