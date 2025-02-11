import { LogLevel, LoggerConfig, LogEntry, LogError } from "./types";

export class Logger {
    private static config: LoggerConfig & { metadata: Record<string, any> } = {
        prettyLogs: false,
        debug: false,
        workerName: "default-worker",
        metadata: {}
    };

    static configure(config: LoggerConfig): void {
        Logger.config = {
            ...Logger.config,
            ...config
        };
    }

    static setLogMetadata(metadata: object): void {
        this.config.metadata = metadata;
    }

    static setLogMetadataKey(key: string, value: any): void {
        this.config.metadata[key] = value;
    }

    static removeLogMetadataKey(key: string): void {
        this.config.metadata[key].delete;
    }

    static clearLogMetadata(): void {
        this.config.metadata = {};
    }

    static createLog({ message, level, errorCode, trace, metadata = {} }: {
        message: string;
        level: LogLevel;
        errorCode?: string;
        trace?: string;
        metadata?: object
    }): void {
        const metadataMerged = {
            ...Logger.config.metadata,
            ...metadata
        };
        const log: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            worker: this.config.workerName!,
            chain: this.config.chainName,
            chain_id: this.config.chainId,
            environment: this.config.environment,
            metadata: metadataMerged
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

    static info(message: string, metadata?: object): void {
        this.createLog({ message, level: "INFO", metadata });
    }

    static debug(message: string, metadata?: object): void {
        if (this.config.debug) this.createLog({ message, level: "DEBUG", metadata });
    }

    static error(params: LogError, metadata?: object): void {
        const { message, errorCode, trace } = params;
        this.createLog({ message, level: "ERROR", errorCode, trace, metadata });
    }

    static warn(params: LogError, metadata?: object): void {
        const { message, errorCode, trace } = params;
        this.createLog({ message, level: "WARN", errorCode, trace, metadata });
    }

    static critical(params: LogError, metadata?: object): void {
        const { message, errorCode, trace } = params;
        this.createLog({ message, level: "CRITICAL", errorCode, trace, metadata });
    }
}