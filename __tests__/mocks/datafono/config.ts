export interface DatafonoConfig {
  type: 'CABLE' | 'WIFI';
  mode: 'simulator' | 'real';
  baseUrl?: string;
  port?: number;
  merchantId?: string;
  terminalId?: string;
  key?: string;
}

const defaultConfig: DatafonoConfig = {
  type: 'WIFI',
  mode: process.env.NODE_ENV === 'test' ? 'simulator' : 'real',
  baseUrl: process.env.DATAFONO_URL || 'https://tpv.comercia.com',
  port: process.env.DATAFONO_PORT ? parseInt(process.env.DATAFONO_PORT) : undefined,
  merchantId: process.env.DATAFONO_MERCHANT_ID || '999999999',
  terminalId: process.env.DATAFONO_TERMINAL_ID || '00000001',
  key: process.env.DATAFONO_KEY
};

export function getConfig(overrides?: Partial<DatafonoConfig>): DatafonoConfig {
  return { ...defaultConfig, ...overrides };
}

// Puertos por defecto
export const PORTS = {
  CABLE: { dev: 2001, prod: 2010 },
  WIFI: { dev: 2002, prod: 2011 },
  STAGING: 2002,  // Puerto para staging
  PRODUCTION: 2011 // Puerto para producción
} as const;

// Códigos de respuesta comunes
export const RESULT_CODES = {
  SUCCESS: 0,
  BUSY: 1001,
  INIT_SUCCESS: 1000,
  DECLINED: 105,
  REFUND_DECLINED: 950,
  NOT_FOUND: 602,
  INVALID_PARAMS: 2,
  INVALID_SOURCE: 1010,
  NETWORK_ERROR: 25,
  DEVICE_ERROR: 21,
  TIMEOUT: 17
} as const;

// Timeouts específicos por tipo (en ms)
export const TIMEOUTS = {
  CABLE: 60000,  // 60 segundos
  WIFI: 60000    // 60 segundos
} as const;

export const ENVIRONMENTS = {
  STAGING: {
    domain: 'datafono.staging.tpv-comercia.es',
    port: 2002,
    merchantId: '329811087',
    terminalId: '00000021'
  },
  PRODUCTION: {
    domain: 'datafono.tpv-comercia.es',
    port: 2011,
    merchantId: '329811087',
    terminalId: '00000021'
  }
} as const; 