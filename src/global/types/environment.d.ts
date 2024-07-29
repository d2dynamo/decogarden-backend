declare namespace NodeJS {
  export interface ProcessEnv {
    //* ------- CUSTOM ENVIRONMENT VARIABLES --------
    // -- System --
    NODE_ENV?: string;
    HTTP_PORT?: string;
    HTTPS_PORT?: string;
    HTTPS_KEY_FILE?: string;
    HTTPS_CERT_FILE?: string;
    JWT_PRIVATE_KEY_PATH?: string;
    JWT_PUBLIC_KEY_PATH?: string;
    SESSION_SECRET?: string;
    // -- MongoDB --
    MONGO_URL?: string;
    MONGO_DB_NAME?: string;
    MONGO_CA?: string;
    MONGO_CERT?: string;
  }
}