import { createClient } from "redis";

class RedisService {
  constructor() {
    this.client = null;
  }

  async initialize() {
    if (this.client) return;

    try {
      this.client = createClient({
        url: process.env.REDIS_URI,
      });

      this.client.on("error", (error) =>
        console.error("Redis Client Error", error),
      );

      await this.client.connect();
      console.log("Redis Connected!");
    } catch (error) {
      console.error("Failed to initialize redis", error);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      console.log("Redis disconnected!");
    }
  }

  async _safe(action, fallback = null) {
    if (!this.client) {
      await this.initialize();
      if (!this.client) return fallback;
    }

    try {
      return await action();
    } catch (error) {
      console.error("Redis error", error);
      return fallback;
    }
  }

  async addUserSession(userId, socketId) {
    await this._safe(async () => {
      const key = `user:${userId}:sessions`;
      await this.client.sAdd(key, socketId);
      await this.client.expire(key, 600); // 10 minutes
    });
  }

  async getUserSessionsCount(userId) {
    return await this._safe(async () => {
      return this.client.sCard(`user:${userId}:sessions`);
    }, 0);
  }

  async removeUserSession(userId, socketId) {
    await this._safe(async () => {
      const key = `user:${userId}:sessions`;
      await this.client.sRem(key, socketId);

      const remaining = await this.getUserSessionsCount(userId);
      if (remaining == 0) {
        await this.client.del(key);
      }
    });
  }

  async removeAllUserSessions(userId) {
    await this._safe(async () => {
      await this.client.del(`user:${userId}:sessions`);
    });
  }

  async isUserOnline(userId) {
    const count = await this.getUserSessionsCount(userId);
    return count > 0;
  }

  async setOtp(email, otp) {
    await this._safe(async () => {
      const key = `otp:${email}`;
      await this.client.set(key, otp);
      await this.client.expire(key, 300); // Expires in 5 minutes (300 seconds)
    });
  }

  async verifyOtp(email, otp) {
    return await this._safe(async () => {
      const key = `otp:${email}`;
      const storedOtp = await this.client.get(key);
      if (storedOtp === otp) {
        await this.client.del(key); // OTP used, delete it
        return true;
      }
      return false;
    }, false);
  }

  async markEmailVerified(email) {
    await this._safe(async () => {
      const key = `verified:${email}`;
      await this.client.set(key, "true");
      await this.client.expire(key, 900); // 15 minutes
    });
  }

  async checkAndConsumeEmailVerification(email) {
    return await this._safe(async () => {
      const key = `verified:${email}`;
      const isVerified = await this.client.get(key);
      if (isVerified === "true") {
        await this.client.del(key);
        return true;
      }
      return false;
    }, false);
  }
}

export default new RedisService();
