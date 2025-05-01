import { Redis as UpstashRedis } from '@upstash/redis';

export class Redis {
  private static redis: any;

  public static configure(upstashRedisRestURL: string, upstashRedisRestToken: string): void {
    if (!upstashRedisRestURL || !upstashRedisRestToken) {
      throw new Error('Please provide both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    }
    this.redis = new UpstashRedis({
      url: upstashRedisRestURL,
      token: upstashRedisRestToken,
    });
  }

  private static buildKey(...parts: string[]): string {
    return parts.join(':');
  }

  public static async setHash(keyParts: string[], data: Record<string, any>): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.hset(key, data);
  }

  public static async getHash(keyParts: string[]): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.hgetall(key);
  }

  public static async getHashField(keyParts: string[], field: string): Promise<string | null> {
    const key = this.buildKey(...keyParts);
    return this.redis.hget(key, field);
  }

  public static async setHashField(keyParts: string[], field: string, value: any): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.hset(key, { [field]: value });
  }

  public static async createSet(keyParts: string[], values: any[]): Promise<any> {
    const key = this.buildKey(...keyParts);

    if (!values || values.length === 0) {
      const exists = await this.redis.exists(key);
      if (!exists) {
        await this.redis.sadd(key, "placeholder");
        return this.redis.srem(key, "placeholder");
      }
      return 0;
    }

    const validValues = values.filter(Boolean);
    if (validValues.length === 0) {
      const exists = await this.redis.exists(key);
      if (!exists) {
        await this.redis.sadd(key, "placeholder");
        return this.redis.srem(key, "placeholder");
      }
      return 0;
    }

    return this.redis.sadd(key, ...validValues);
  }

  public static async getSetMembers(keyParts: string[]): Promise<string[]> {
    const key = this.buildKey(...keyParts);
    return this.redis.smembers(key);
  }

  public static async setString(keyParts: string[], value: string): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.set(key, value);
  }

  public static async getString(keyParts: string[]): Promise<string | null> {
    const key = this.buildKey(...keyParts);
    return this.redis.get(key);
  }

  public static async addToSortedSet(keyParts: string[], score: number, member: string): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.zadd(key, { score, member });
  }

  public static async getSortedSetByScore(keyParts: string[], minScore: number, maxScore: number): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.zrangebyscore(key, minScore, maxScore);
  }

  public static async pipelineGet(
    keys: string[],
    types: ('none' | 'string' | 'set' | 'hash')[]
  ): Promise<any[]> {
    const pipeline = this.redis.pipeline();
    const mapping: (number | null)[] = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const type = types[i];

      if (type === 'none') {
        mapping.push(null);
      } else if (type === 'string') {
        mapping.push(pipeline.commands.length);
        pipeline.get(key);
      } else if (type === 'set') {
        mapping.push(pipeline.commands.length);
        pipeline.smembers(key);
      } else if (type === 'hash') {
        mapping.push(pipeline.commands.length);
        pipeline.hgetall(key);
      } else {
        mapping.push(null);
      }
    }

    const results = await pipeline.exec();
    return keys.map((_, i) =>
      mapping[i] === null ? null : results[mapping[i] as number]
    );
  }

  public static async pipelineSet(
    ops: { 
      keyParts: string[]; 
      type: 'hash' | 'set' | 'string' | 'hashField'; 
      data: any;
      field?: string;
    }[]
  ): Promise<any> {
    const pipeline = this.redis.pipeline();

    for (const op of ops) {
      const key = this.buildKey(...op.keyParts);

      if (op.type === 'hash') {
        pipeline.hset(key, op.data);
      } else if (op.type === 'hashField') {
        if (op.field === undefined) {
          throw new Error('Field is required for hashField operations');
        }
        pipeline.hset(key, { [op.field]: op.data });
      } else if (op.type === 'set') {
        pipeline.sadd(key, ...op.data);
      } else if (op.type === 'string') {
        pipeline.set(key, op.data);
      }
    }

    return pipeline.exec();
  }

  public static async getBasicInfoForItems(itemIds: string[]): Promise<any> {
    const pipeline = this.redis.pipeline();

    for (const id of itemIds) {
      pipeline.hgetall(this.buildKey("items", id, "basic"));
    }

    return pipeline.exec();
  }

  public static async lRange(keyParts: string[], start: number, stop: number): Promise<any[]> {
    const key = this.buildKey(...keyParts);
    return this.redis.lrange(key, start, stop);
  }

  public static async rPush(keyParts: string[], ...values: any[]): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.rpush(key, ...values);
  }

  public static async delKey(keyParts: string[]): Promise<any> {
    const key = this.buildKey(...keyParts);
    return this.redis.del(key);
  }

  public static async removeFromSet(keyParts: string[], ...values: any[]): Promise<any> {
    // If no values to remove, return early
    if (!values || values.length === 0) {
      return 0;
    }

    // Filter out any null or undefined values
    const validValues = values.filter(Boolean);
    if (validValues.length === 0) {
      return 0;
    }

    const key = this.buildKey(...keyParts);
    return this.redis.srem(key, ...validValues);
  }

  public static async getSetLength(keyParts: string[]): Promise<number> {
    const key = this.buildKey(...keyParts);
    return this.redis.scard(key);
  }

  public static async addToSet(keyParts: string[], ...values: any[]): Promise<any> {
    // If no values to add, return early
    if (!values || values.length === 0) {
      return 0;
    }

    // Filter out any null or undefined values
    const validValues = values.filter(Boolean);
    if (validValues.length === 0) {
      return 0;
    }

    const key = this.buildKey(...keyParts);
    return this.redis.sadd(key, ...validValues);
  }
}