declare namespace NodeJS {
  export interface ProcessEnv {
    //* ------- CUSTOM ENVIRONMENT VARIABLES --------
    // -- System --
    NODE_ENV?: string;
    HTTP_PORT?: string;
    HTTPS_PORT?: string;
    HTTPS_KEY_FILE?: string;
    HTTPS_CERT_FILE?: string;
    // -- MongoDB --
    MONGO_URL?: string;
    MONGO_DB_NAME?: string;
    MONGO_CERT_PATH?: string;
    MONGO_KEY_PATH?: string;
  }
}
