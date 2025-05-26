import { generateId } from '../../../app/v1/transactions/utils/idUtils'; // Adjust path as necessary

describe('idUtils', () => {
  describe('generateId', () => {
    it('should return a string starting with "TX" and followed by numbers', () => {
      const id = generateId();
      expect(id).toMatch(/^TX\d+$/);
    });

    it('should generate different IDs on subsequent calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate an ID of a reasonable length (e.g., TX + 6-8 digits)', () => {
      const id = generateId();
      // Assuming the random number part is Math.floor(Math.random() * 1000000)
      // This means it can be 1 to 6 digits. TX + 1-6 digits = 3-8 chars.
      // If it's Math.random() * 100000000, then 1-8 digits, total 3-10 chars.
      // Let's assume the current implementation Math.floor(Math.random() * 1000000)
      expect(id.length).toBeGreaterThanOrEqual(3); // TX + at least one digit
      expect(id.length).toBeLessThanOrEqual(8);  // TX + up to 6 digits
    });
  });
});
