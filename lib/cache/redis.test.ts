import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isRedisConfigured,
  redisGet,
  redisSet,
  redisDel,
  redisPing,
  _resetRedisClientForTesting,
} from './redis';
import { Redis } from '@upstash/redis';

vi.mock('@upstash/redis');

describe('Upstash Redis L2 Cache Layer', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    _resetRedisClientForTesting();
    process.env = { ...originalEnv };
  });

  describe('Unconfigured Environment (Graceful Degradation)', () => {
    it('should return false for isRedisConfigured when env vars are missing', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      expect(isRedisConfigured()).toBe(false);
    });

    it('should safely return null or false without throwing when Redis is unconfigured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const getRes = await redisGet('test:key');
      const setRes = await redisSet('test:key', { data: 123 });
      const delRes = await redisDel('test:key');
      const pingRes = await redisPing();

      expect(getRes).toBeNull();
      expect(setRes).toBe(false);
      expect(delRes).toBe(false);
      expect(pingRes).toBe(false);
    });
  });

  describe('Configured Environment', () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-token';
    });

    it('should report configured true when env vars are present', () => {
      expect(isRedisConfigured()).toBe(true);
    });

    it('should perform get, set, and del operations through Upstash client', async () => {
      const mockGet = vi.fn().mockResolvedValue({ stateId: 'ws_123' });
      const mockSet = vi.fn().mockResolvedValue('OK');
      const mockDel = vi.fn().mockResolvedValue(1);
      const mockPing = vi.fn().mockResolvedValue('PONG');

      (Redis as any).mockImplementation(function (this: any) {
        this.get = mockGet;
        this.set = mockSet;
        this.del = mockDel;
        this.ping = mockPing;
      });

      const ping = await redisPing();
      expect(ping).toBe(true);
      expect(mockPing).toHaveBeenCalled();

      const setSuccess = await redisSet('kortex:state:v1', { stateId: 'ws_123' }, 300);
      expect(setSuccess).toBe(true);
      expect(mockSet).toHaveBeenCalledWith('kortex:state:v1', { stateId: 'ws_123' }, { ex: 300 });

      const data = await redisGet<{ stateId: string }>('kortex:state:v1');
      expect(data).toEqual({ stateId: 'ws_123' });
      expect(mockGet).toHaveBeenCalledWith('kortex:state:v1');

      const delSuccess = await redisDel('kortex:state:v1');
      expect(delSuccess).toBe(true);
      expect(mockDel).toHaveBeenCalledWith('kortex:state:v1');
    });

    it('should fail open (return null/false) when Redis encounters network errors', async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error('Network timeout'));
      const mockSet = vi.fn().mockRejectedValue(new Error('Connection reset'));

      (Redis as any).mockImplementation(function (this: any) {
        this.get = mockGet;
        this.set = mockSet;
      });

      const data = await redisGet('kortex:state:v1');
      expect(data).toBeNull();

      const setSuccess = await redisSet('kortex:state:v1', { foo: 'bar' });
      expect(setSuccess).toBe(false);
    });
  });
});
