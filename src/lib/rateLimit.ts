/**
 * Botlarga qarshi himoya va Rate Limiting vositalari
 * 1. Honeypot tekshiruvi: inson ko'rmaydigan yashirin input botlar tomonidan to'ldirilsa darhol rad etiladi.
 * 2. Time-to-fill tekshiruvi: formani 1.5 soniyadan kam vaqtda to'ldirish bot ekanligini bildiradi.
 * 3. Rate Limit / Cooldown: bir xil amalni qisqa vaqtda ketma-ket qayta jo'natishni cheklaydi (masalan: har 30 soniyada faqat 1 ta buyurtma).
 */

interface RateLimitTracker {
  [action: string]: number; // oxirgi amal vaqti (timestamp)
}

const lastActions: RateLimitTracker = {};

export const antiBot = {
  /**
   * Honeypot inputi bo'shligini tekshiradi
   * @param honeypotValue - yashirin input qiymati
   * @returns true agar inson bo'lsa (qiymat bo'sh), false agar bot to'ldirgan bo'lsa
   */
  checkHoneypot(honeypotValue: string): boolean {
    return !honeypotValue || honeypotValue.trim().length === 0;
  },

  /**
   * Forma ochilganidan to'ldirilgunicha o'tgan vaqtni tekshiradi
   * @param formStartTime - forma ochilgan vaqti (ms)
   * @param minSeconds - minimal kutish vaqti (default 1.5 soniya)
   */
  checkSubmissionSpeed(formStartTime: number, minSeconds = 1.5): boolean {
    const elapsed = (Date.now() - formStartTime) / 1000;
    return elapsed >= minSeconds;
  },

  /**
   * Foydalanuvchining ma'lum bir amalni qayta bajarishiga cooldown limit qo'yadi
   * @param actionKey - amal nomi (masalan 'order_submit', 'review_submit')
   * @param cooldownSeconds - kutish vaqti (soniya)
   * @returns { allowed: boolean, remainingSeconds: number }
   */
  checkRateLimit(actionKey: string, cooldownSeconds = 30): { allowed: boolean; remainingSeconds: number } {
    const now = Date.now();
    const lastTime = lastActions[actionKey] || 0;
    const diff = (now - lastTime) / 1000;

    if (diff < cooldownSeconds) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil(cooldownSeconds - diff),
      };
    }

    lastActions[actionKey] = now;
    return { allowed: true, remainingSeconds: 0 };
  },
};
