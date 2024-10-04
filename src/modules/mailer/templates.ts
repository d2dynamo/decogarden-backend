export enum SendgridTemplates {
  "verifyEmail" = "d-7c3ad0b0dbfe420eb28623ffe29ddc3e",
}

export interface verifyEmailData {
  verification_code: string;
}

export interface TemplateDataMap {
  [SendgridTemplates.verifyEmail]: verifyEmailData;
}
