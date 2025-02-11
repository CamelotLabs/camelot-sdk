export type LogLevel = "INFO" | "ERROR" | "WARN" | "DEBUG" | "CRITICAL";

export interface LogError {
    message: string;
    errorCode?: string;
    trace?: string;
}

export interface LoggerConfig {
    chainName?: string;
    chainId?: string;
    environment?: string;
    workerName?: string;
    prettyLogs?: boolean;
    debug?: boolean;
    metadata?: object;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    worker: string;
    chain?: string;
    chain_id?: string;
    environment?: string;
    error_code?: string;
    stack_trace?: string;
    metadata?: object;
}