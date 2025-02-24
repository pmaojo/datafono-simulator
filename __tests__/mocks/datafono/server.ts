import { createServer, IncomingMessage, ServerResponse } from 'http';
import { DatafonoType, DatafonoResponse, Ticket, Tokenization, PORTS, RESULT_CODES, TIMEOUTS } from './types';
import { portManager } from './ports';
import { ENVIRONMENTS } from './config';

interface ServerInfo {
  port: number;
  domain: string;
  close: () => Promise<void>;
}

// Estado de las transacciones en curso
interface TransactionState {
  status: 'pending' | 'processing' | 'completed';
  response: DatafonoResponse;
  attempts: number;
  type: DatafonoType;
  startTime: number;
  tokenization?: Tokenization;
}

const servers = new Map<number, ReturnType<typeof createServer>>();
const transactions = new Map<string, TransactionState>();
const tokens = new Map<string, Tokenization>();

function generateId() {
  return `TX${Math.floor(Math.random() * 1000000)}`;
}

function generateToken(): Tokenization {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const subscriptionId = Date.now().toString();
  return {
    subscriptionId,
    token,
    tokenizerCode: '0'
  };
}

function createTicket(amount: number, type: string = 'Payment', success = true): Ticket | undefined {
  if (!success) return undefined;

  const now = new Date();
  return {
    AID: 'A0000000031010',
    ARC: '00',
    ATC: Math.floor(Math.random() * 10000).toString().padStart(5, '0'),
    PSN: '01',
    Amount: (amount * 100).toFixed(0),
    Authorization: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
    CardBank: 'Comercia Global Payments',
    CardHolder: '',
    CardIssuer: 'VISA CLASICA',
    CardNumber: '************2825',
    CardTechnology: 1,
    CardType: '',
    Currency: 'EUR',
    Date: now.toISOString().split('T')[0].replace(/-/g, ''),
    Id: Math.floor(Math.random() * 1000000).toString(),
    Language: 'es',
    Location: 'BARCELONA',
    MerchantId: '329811087',
    MerchantName: 'Comercia Global Payments PRUEBAS',
    Modifiers: [],
    OriginalTransactionDate: '',
    OriginalTransactionId: '',
    PinIndicator: 1,
    SignatureIndicator: 0,
    Status: '0',
    Templates: [],
    TerminalId: '00000021',
    Time: now.toTimeString().slice(0, 5).replace(':', ''),
    Type: type
  };
}

function createResponse(
  resultCode: number,
  resultMessage: string,
  extras: Partial<DatafonoResponse> = {}
): DatafonoResponse {
  return {
    resultCode,
    resultMessage,
    ...extras
  };
}

async function parseBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return {};
  }
}

async function processTransaction(
  txId: string,
  type: DatafonoType,
  body: any,
  successRate = 0.9
): Promise<DatafonoResponse> {
  // Respuesta inicial
  const initialResponse = createResponse(
    RESULT_CODES.BUSY,
    'Transaction in progress',
    {
      transactionId: txId,
      orderId: body.orderId
    }
  );

  // Guardar estado inicial
  transactions.set(txId, {
    status: 'pending',
    response: initialResponse,
    attempts: 0,
    type,
    startTime: Date.now()
  });

  // Simular tiempo de procesamiento base
  const baseProcessingTime = type === 'WIFI'
    ? Math.random() * 4000 + 1000  // WiFi: 1-5 segundos
    : Math.random() * 2000 + 500;  // Cable: 0.5-2.5 segundos

  // Procesar en background
  setTimeout(() => {
    const state = transactions.get(txId);
    if (!state) return;

    // Actualizar estado a procesando
    state.status = 'processing';
    state.attempts++;

    // Simular tiempo de procesamiento adicional
    setTimeout(() => {
      const success = Math.random() < successRate;
      let tokenization: Tokenization | undefined;

      // Manejar tokenización
      if (body.tokenization) {
        if (body.tokenization.createToken) {
          // Crear nuevo token
          tokenization = generateToken();
          tokens.set(tokenization.token!, tokenization);
        } else if (body.tokenization.token) {
          // Usar token existente
          tokenization = tokens.get(body.tokenization.token);
          if (!tokenization) {
            state.status = 'completed';
            state.response = createResponse(
              RESULT_CODES.DECLINED,
              'Invalid token'
            );
            return;
          }
        }
      }

      const finalResponse = createResponse(
        success ? RESULT_CODES.SUCCESS : RESULT_CODES.DECLINED,
        success ? 'Transaction approved' : 'Transaction declined',
        {
          transactionId: txId,
          orderId: body.orderId,
          ticket: createTicket(body.amount, body.type || 'Payment', success),
          tokenization
        }
      );

      state.status = 'completed';
      state.response = finalResponse;
    }, baseProcessingTime);
  }, 500);

  return initialResponse;
}

async function getLastTransaction(type: DatafonoType): Promise<DatafonoResponse> {
  // Buscar la última transacción para este tipo de datáfono
  let lastTx: TransactionState | undefined;
  let lastTime = 0;

  for (const [_, tx] of transactions) {
    if (tx.type === type && tx.startTime > lastTime) {
      lastTx = tx;
      lastTime = tx.startTime;
    }
  }

  if (!lastTx) {
    return createResponse(RESULT_CODES.NOT_FOUND, 'No transactions found');
  }

  // Simular errores de red aleatorios para WiFi
  if (type === 'WIFI' && Math.random() < 0.1) {
    throw new Error('Network error');
  }

  // Si la transacción está pendiente o procesando, incrementar intentos
  if (lastTx.status !== 'completed') {
    lastTx.attempts++;

    // Simular timeout después de muchos intentos
    if (lastTx.attempts > 20) {
      lastTx.status = 'completed';
      lastTx.response = createResponse(
        RESULT_CODES.TIMEOUT,
        'Transaction timeout',
        {
          transactionId: lastTx.response.transactionId,
          orderId: lastTx.response.orderId
        }
      );
    }
  }

  return lastTx.response;
}

export async function startMockServer(type: 'STAGING' | 'PRODUCTION'): Promise<ServerInfo> {
  const config = ENVIRONMENTS[type];
  const port = PORTS[type];
  
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Verificar el host
    const host = req.headers.host?.toLowerCase();
    if (!host || !host.includes(config.domain)) {
      res.writeHead(400);
      res.end(JSON.stringify(createResponse(
        RESULT_CODES.INVALID_SOURCE,
        'Invalid host'
      )));
      return;
    }

    try {
      console.log(`[${type}] Request to ${req.url} with method ${req.method}`);
      console.log(`[${type}] Headers:`, req.headers);

      // Habilitar CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-SOURCE');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Verificar headers
      if (req.headers['x-source'] !== 'COMERCIA') {
        console.log(`[${type}] Invalid X-SOURCE header:`, req.headers['x-source']);
        res.writeHead(400);
        res.end(JSON.stringify(createResponse(
          RESULT_CODES.INVALID_SOURCE,
          'Invalid X-SOURCE header'
        )));
        return;
      }

      // Leer body si es POST
      let body = {};
      if (req.method === 'POST') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        try {
          body = JSON.parse(Buffer.concat(chunks).toString());
          console.log(`[${type}] Request body:`, body);
        } catch (e) {
          console.log(`[${type}] Error parsing body:`, e);
          res.writeHead(400);
          res.end(JSON.stringify(createResponse(
            RESULT_CODES.INVALID_PARAMS,
            'Invalid JSON body'
          )));
          return;
        }
      }

      // Manejar endpoints
      const handlers: Record<string, (body: any) => Promise<DatafonoResponse>> = {
        '/api/v1/is-available': async () => createResponse(
          RESULT_CODES.SUCCESS,
          'Device available'
        ),

        '/api/v1/init': async (body) => {
          if (!body?.merchantId || !body?.terminalId) {
            return createResponse(RESULT_CODES.INVALID_PARAMS, 'Invalid merchant or terminal ID');
          }
          return createResponse(RESULT_CODES.INIT_SUCCESS, 'Device initialized');
        },

        '/api/v1/payment': async (body) => {
          if (!body?.amount || !body?.orderId) {
            return createResponse(RESULT_CODES.INVALID_PARAMS, 'Invalid parameters');
          }
          return processTransaction(generateId(), type, {
            ...body,
            type: 'Payment',
            ticket: createTicket(body.amount, 'Payment', true)
          });
        },

        '/api/v1/authorize': async (body) => {
          if (!body?.amount || !body?.orderId) {
            console.log(`[${type}] Invalid authorize params:`, body);
            return createResponse(RESULT_CODES.INVALID_PARAMS, 'Invalid parameters');
          }
          return processTransaction(generateId(), type, { ...body, type: 'Preauthorization' });
        },

        '/api/v1/status': async (body) => {
          if (!body?.transactionId || !body?.merchantId || !body?.terminalId) {
            return createResponse(RESULT_CODES.INVALID_PARAMS, 'Missing required parameters');
          }
          const tx = transactions.get(body.transactionId);
          if (!tx) {
            return createResponse(RESULT_CODES.NOT_FOUND, 'Transaction not found');
          }
          return tx.response;
        },

        '/api/v1/refund': async (body) => {
          if (!body?.amount || !body?.transactionId) {
            return createResponse(RESULT_CODES.INVALID_PARAMS, 'Invalid parameters');
          }
          return processTransaction(generateId(), type, {
            ...body,
            type: 'Refund',
            ticket: createTicket(body.amount, 'Refund', true)
          });
        }
      };

      const handler = handlers[req.url || ''];
      if (!handler) {
        console.log(`[${type}] Endpoint not found:`, req.url);
        res.writeHead(404);
        res.end(JSON.stringify(createResponse(
          RESULT_CODES.NOT_FOUND,
          'Endpoint not found'
        )));
        return;
      }

      const response = await handler(body);
      console.log(`[${type}] Response:`, response);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));

    } catch (error) {
      console.error(`[${type}] Server error:`, error);
      res.writeHead(500);
      res.end(JSON.stringify(createResponse(
        RESULT_CODES.DEVICE_ERROR,
        'Internal server error'
      )));
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`Mock Datafono ${type} running on port ${port}`);
      console.log(`Listening on https://${config.domain}`);
      resolve();
    });
  });

  servers.set(port, server);

  return {
    port,
    domain: config.domain,
    close: async () => {
      const server = servers.get(port);
      if (server) {
        await new Promise((resolve) => server.close(resolve));
        servers.delete(port);
      }
    }
  };
}

export async function stopMockServer(type?: DatafonoType) {
  const promises: Promise<void>[] = [];

  if (type) {
    const port = await portManager.getPort(type);
    const server = servers.get(port);
    if (server) {
      promises.push(new Promise((resolve) => server.close(() => {
        portManager.releasePort(port);
        servers.delete(port);
        resolve();
      })));
    }
  } else {
    for (const [port, server] of servers.entries()) {
      promises.push(new Promise((resolve) => server.close(() => {
        portManager.releasePort(port);
        servers.delete(port);
        resolve();
      })));
    }
  }

  await Promise.all(promises);
} 