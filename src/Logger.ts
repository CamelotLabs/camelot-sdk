import { LogLevel, LogMessage, LoggerConfig } from "./types";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    worker: string;
    chain?: string;
    environment?: string;
    error_code?: string;
    stack_trace?: string;
}

export class Logger {
    private static config: LoggerConfig = {
        prettyLogs: false,
        debug: false,
        workerName: "default-worker"
    };

    static configure(config: LoggerConfig): void {
        Logger.config = {
            ...Logger.config,
            ...config
        };
    }

    static createLog(message: string, level: LogLevel, errorCode?: string, trace?: string): void {
        const log: LogEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            worker: this.config.workerName!,
            chain: this.config.chainId,
            environment: this.config.environment,
        }
        if (level === "ERROR" || level === "CRITICAL" || level === "WARN") {
            log.error_code = errorCode;
            log.stack_trace = trace;
        }
    
        if (this.config.prettyLogs) {
            console.log(log);
        } else {
            console.log(JSON.stringify(log));
        }
    }

    static info(message: string): void {
        this.createLog(message, "INFO");
    }

    static error(params: LogMessage): void {
        const { message, errorCode, trace } = params;
        this.createLog(message, "ERROR", errorCode, trace);
    }

    static warn(message: string, errorCode?: string, trace?: string): void {
        this.createLog(message, "WARN", errorCode, trace);
    }

    static debug(message: string): void {
        if (this.config.debug) this.createLog(message, "DEBUG");
    }

    static critical(message: string, errorCode?: string, trace?: string): void {
        this.createLog(message, "CRITICAL", errorCode, trace);
    }
}