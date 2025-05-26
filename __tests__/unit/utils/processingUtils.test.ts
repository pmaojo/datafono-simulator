import { getProcessingTime } from '../../../app/v1/transactions/utils/processingUtils'; // Adjust path
import { DEVICE_TYPE_WIFI, DEVICE_TYPE_CABLE } from '../../../app/v1/transactions/constants'; // Adjust path

describe('processingUtils', () => {
  describe('getProcessingTime', () => {
    let originalMathRandom: () => number;

    beforeEach(() => {
      originalMathRandom = Math.random;
    });

    afterEach(() => {
      Math.random = originalMathRandom;
    });

    it('should return a processing time within the WIFI range [2000, 6000) when deviceType is WIFI', () => {
      // Mock Math.random to return values that cover min, mid, and just below max
      const mockValues = [0, 0.5, 0.999999]; // Corresponds to 2000, 4000, almost 6000
      
      mockValues.forEach(mockValue => {
        Math.random = jest.fn().mockReturnValue(mockValue);
        const time = getProcessingTime(DEVICE_TYPE_WIFI);
        expect(time).toBeGreaterThanOrEqual(2000);
        expect(time).toBeLessThan(6000); // Max is exclusive: Math.random() * 4000 + 2000
      });
    });

    it('should return a processing time within the CABLE range [1000, 3000) when deviceType is CABLE', () => {
      // Mock Math.random to return values that cover min, mid, and just below max
      const mockValues = [0, 0.5, 0.999999]; // Corresponds to 1000, 2000, almost 3000
      
      mockValues.forEach(mockValue => {
        Math.random = jest.fn().mockReturnValue(mockValue);
        const time = getProcessingTime(DEVICE_TYPE_CABLE);
        expect(time).toBeGreaterThanOrEqual(1000);
        expect(time).toBeLessThan(3000); // Max is exclusive: Math.random() * 2000 + 1000
      });
    });

    it('should default to CABLE range if deviceType is not WIFI', () => {
      Math.random = jest.fn().mockReturnValue(0.5); // Mid-range for CABLE (2000ms)
      const time = getProcessingTime('UNKNOWN_DEVICE');
      expect(time).toBeGreaterThanOrEqual(1000);
      expect(time).toBeLessThan(3000);
      // Check specific value based on mock
      // Math.random() * 2000 + 1000 = 0.5 * 2000 + 1000 = 1000 + 1000 = 2000
      expect(time).toBe(2000); 
    });

    it('should produce times at the lower boundary of the range when Math.random is 0', () => {
      Math.random = jest.fn().mockReturnValue(0);
      
      const wifiTime = getProcessingTime(DEVICE_TYPE_WIFI);
      expect(wifiTime).toBe(2000); // 0 * 4000 + 2000
      
      const cableTime = getProcessingTime(DEVICE_TYPE_CABLE);
      expect(cableTime).toBe(1000); // 0 * 2000 + 1000
    });

    it('should produce times near the upper boundary (but not equal) of the range when Math.random is close to 1', () => {
      Math.random = jest.fn().mockReturnValue(0.9999999999); // A value very close to 1
      
      const wifiTime = getProcessingTime(DEVICE_TYPE_WIFI);
      expect(wifiTime).toBeGreaterThanOrEqual(2000);
      expect(wifiTime).toBeLessThan(6000);
      // Check it's close to the max: 0.9999999999 * 4000 + 2000 is very close to 6000
      expect(wifiTime).toBeCloseTo(6000, 0); 
      
      const cableTime = getProcessingTime(DEVICE_TYPE_CABLE);
      expect(cableTime).toBeGreaterThanOrEqual(1000);
      expect(cableTime).toBeLessThan(3000);
      // Check it's close to the max: 0.9999999999 * 2000 + 1000 is very close to 3000
      expect(cableTime).toBeCloseTo(3000, 0);
    });
  });
});
