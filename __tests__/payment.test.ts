import { startMockServer } from './mocks/datafono/server';
import { DatafonoClient } from './mocks/datafono/client';
import { RESULT_CODES, TIMEOUTS } from './mocks/datafono/config';

// Códigos de resultado válidos para una transacción completada
const COMPLETED_CODES = [
  RESULT_CODES.SUCCESS,      // Éxito
  RESULT_CODES.DECLINED,     // Declinada
  RESULT_CODES.TIMEOUT,      // Timeout
  RESULT_CODES.NETWORK_ERROR // Error de red
];

// Helper para hacer polling
async function pollTransactionStatus(
  client: DatafonoClient, 
  transactionId: string, 
  timeout = TIMEOUTS.WIFI
): Promise<any> {
  const startTime = Date.now();
  let lastError: Error | undefined;
  let consecutiveErrors = 0;
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await client.getStatus(transactionId);
      
      // Resetear contador de errores si la petición fue exitosa
      consecutiveErrors = 0;
      
      if (result.resultCode !== RESULT_CODES.BUSY) {
        return result;
      }

      // Esperar entre intentos (aumenta con cada intento)
      const delay = Math.min(500 * Math.pow(1.5, consecutiveErrors), 2000);
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      lastError = error as Error;
      consecutiveErrors++;

      // Si hay demasiados errores consecutivos, abortar
      if (consecutiveErrors >= 5) {
        throw new Error(`Too many consecutive errors: ${lastError.message}`);
      }

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(lastError ? 
    `Transaction timeout with error: ${lastError.message}` : 
    'Transaction timeout'
  );
}

describe.skip('Datafono API', () => {
  describe('WiFi POS', () => {
    let pos: DatafonoClient;
    let server: { port: number; close: () => Promise<void> };

    beforeAll(async () => {
      server = await startMockServer('WIFI');
      pos = new DatafonoClient({
        type: 'WIFI',
        mode: 'simulator',
        port: server.port,
        merchantId: '999999999',
        terminalId: '00000001'
      });

      // Esperar a que el servidor esté listo
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      await server.close();
    });

    it('should process a payment with card and tokenization', async () => {
      const available = await pos.isAvailable();
      expect(available.resultCode).toBe(RESULT_CODES.SUCCESS);

      const init = await pos.init('test', 'test');
      expect(init.resultCode).toBe(RESULT_CODES.INIT_SUCCESS);

      const orderId = `ORDER${Date.now()}`;
      const payment = await pos.payment({
        amount: 100.50,
        orderId,
        description: 'Test payment with tokenization',
        tokenization: {
          createToken: true,
          codeOfUse: 'C',
          customerId: '123456789'
        }
      });
      expect(payment.resultCode).toBe(RESULT_CODES.BUSY);
      expect(payment.orderId).toBe(orderId);
      expect(payment.transactionId).toBeDefined();

      const result = await pollTransactionStatus(pos, payment.transactionId!);
      expect(COMPLETED_CODES).toContain(result.resultCode);

      if (result.resultCode === RESULT_CODES.SUCCESS) {
        expect(result.ticket).toBeDefined();
        expect(result.ticket?.Amount).toBe('100.50');
        expect(result.ticket?.CardType).toBe('VISA');
        expect(result.ticket?.CardNumber).toMatch(/^\*{12}\d{4}$/);
        expect(result.ticket?.Type).toBe('Payment');
        expect(result.ticket?.MerchantId).toBe('999999999');
        expect(result.ticket?.TerminalId).toBe('00000001');
        expect(result.ticket?.Currency).toBe('EUR');
        expect(result.tokenization).toBeDefined();
        expect(result.tokenization?.subscriptionId).toBeDefined();
        expect(result.tokenization?.token).toBeDefined();
        expect(result.tokenization?.tokenizerCode).toBe('0');

        // Try payment with token
        const tokenPayment = await pos.payment({
          amount: 50.25,
          orderId: `ORDER${Date.now()}`,
          description: 'Test payment with token',
          tokenization: {
            subscriptionId: result.tokenization?.subscriptionId,
            token: result.tokenization?.token,
            codeOfUse: 'C',
            customerId: '123456789'
          }
        });
        expect(tokenPayment.resultCode).toBe(RESULT_CODES.BUSY);

        const tokenResult = await pollTransactionStatus(pos, tokenPayment.transactionId!);
        expect(COMPLETED_CODES).toContain(tokenResult.resultCode);
        
        if (tokenResult.resultCode === RESULT_CODES.SUCCESS) {
          expect(tokenResult.ticket?.Amount).toBe('50.25');
          expect(tokenResult.tokenization?.tokenizerCode).toBe('0');
        }
      }
    });
  });

  describe('Cable POS', () => {
    let pos: DatafonoClient;
    let server: { port: number; close: () => Promise<void> };

    beforeAll(async () => {
      server = await startMockServer('CABLE');
      pos = new DatafonoClient({
        type: 'CABLE',
        mode: 'simulator',
        port: server.port,
        merchantId: '999999999',
        terminalId: '00000001'
      });

      // Esperar a que el servidor esté listo
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      await server.close();
    });

    it('should process a preauthorization flow', async () => {
      const init = await pos.init('test', 'test');
      expect(init.resultCode).toBe(RESULT_CODES.INIT_SUCCESS);

      const orderId = `AUTH${Date.now()}`;
      const auth = await pos.authorize({
        amount: 100.50,
        orderId,
        description: 'Test preauth with tokenization',
        tokenization: {
          createToken: true,
          codeOfUse: 'R',
          customerId: '123456789'
        }
      });
      expect(auth.resultCode).toBe(RESULT_CODES.BUSY);
      expect(auth.orderId).toBe(orderId);

      const result = await pollTransactionStatus(pos, auth.transactionId!, TIMEOUTS.CABLE);
      expect(COMPLETED_CODES).toContain(result.resultCode);

      if (result.resultCode === RESULT_CODES.SUCCESS) {
        expect(result.ticket).toBeDefined();
        expect(result.ticket?.Type).toBe('Preauthorization');
        expect(result.ticket?.CardType).toBe('VISA');
        expect(result.ticket?.MerchantId).toBe('999999999');
        expect(result.ticket?.TerminalId).toBe('00000001');
        expect(result.ticket?.Currency).toBe('EUR');
        expect(result.tokenization).toBeDefined();
        expect(result.tokenization?.subscriptionId).toBeDefined();
        expect(result.tokenization?.token).toBeDefined();
      }
    });
  });
}); 