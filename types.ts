export type LogLevel = "INFO" | "ERROR" | "WARN" | "DEBUG" | "CRITICAL";

export interface LogMessage {
    message: string;
    errorCode?: string;
    trace?: string;
}
