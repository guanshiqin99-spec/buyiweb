import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

interface LockEntry {
  failures: number;
  lockedUntil: number;
  lastAttempt: number;
}

/** 登录失败锁定服务（账号 + IP 双维度） */
@Injectable()
export class LoginLockoutService {
  private readonly logger = new Logger(LoginLockoutService.name);
  private readonly accountMap = new Map<string, LockEntry>();
  private readonly ipMap = new Map<string, LockEntry>();
  /** 失败计数 30 分钟滑窗内有效 */
  private readonly windowMs = 30 * 60 * 1000;

  constructor(
    private readonly threshold: number,
    private readonly lockMinutes: number,
  ) {}

  /** 登录前检查：被锁定则抛异常 */
  ensureNotLocked(accountKey: string, ip: string): void {
    const now = Date.now();
    const acc = this.accountMap.get(accountKey);
    const ipEntry = this.ipMap.get(ip);
    if (acc && acc.lockedUntil > now) {
      const remain = Math.ceil((acc.lockedUntil - now) / 1000 / 60);
      throw new HttpException(`账号已被锁定，请 ${remain} 分钟后重试`, HttpStatus.BAD_REQUEST);
    }
    if (ipEntry && ipEntry.lockedUntil > now) {
      const remain = Math.ceil((ipEntry.lockedUntil - now) / 1000 / 60);
      throw new HttpException(`该 IP 因多次失败已被锁定，请 ${remain} 分钟后重试`, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  /** 登录失败：累加计数，达阈值锁定 */
  recordFailure(accountKey: string, ip: string): void {
    const now = Date.now();
    this.bump(this.accountMap, accountKey, now);
    this.bump(this.ipMap, ip, now);
    const acc = this.accountMap.get(accountKey)!;
    if (acc.failures >= this.threshold) {
      acc.lockedUntil = now + this.lockMinutes * 60 * 1000;
      this.logger.warn(`账号 ${accountKey} 因连续失败 ${acc.failures} 次被锁定 ${this.lockMinutes} 分钟，IP=${ip}`);
    }
    const ipEntry = this.ipMap.get(ip)!;
    if (ipEntry.failures >= this.threshold * 2) {
      // IP 阈值更高（疑似扫描），同样锁定
      ipEntry.lockedUntil = now + this.lockMinutes * 60 * 1000;
      this.logger.warn(`IP ${ip} 因失败 ${ipEntry.failures} 次被锁定 ${this.lockMinutes} 分钟`);
    }
  }

  /** 登录成功：清零计数 */
  recordSuccess(accountKey: string, ip: string): void {
    this.accountMap.delete(accountKey);
    this.ipMap.delete(ip);
  }

  private bump(map: Map<string, LockEntry>, key: string, now: number): void {
    const existing = map.get(key);
    if (!existing || existing.lastAttempt + this.windowMs < now) {
      map.set(key, { failures: 1, lockedUntil: 0, lastAttempt: now });
      return;
    }
    existing.failures += 1;
    existing.lastAttempt = now;
  }
}
