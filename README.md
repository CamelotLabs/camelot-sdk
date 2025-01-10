# Camelot SDK

This is a TypeScript SDK for interacting with Camelot services.

Current Features:
- Logger

## Installation

```bash
npm install camelot-sdk
```

## Logger Usage

```typescript
import { Logger } from 'camelot-sdk';

Logger.configure({
    prettyLogs: true,
    debug: true,
    workerName: 'worker-name',
    chainId: '1',
    chainName: 'arbitrum',
    environment: 'staging || prod'
});
```