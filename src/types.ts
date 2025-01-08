export type LogLevel = "INFO" | "ERROR" | "WARN" | "DEBUG" | "CRITICAL";

export interface LogMessage {
    message: string;
    errorCode?: string;
    trace?: string;
}

export interface LoggerConfig {
    chainId?: string;
    environment?: string;
    workerName?: string;
    prettyLogs?: boolean;
    debug?: boolean;
}
