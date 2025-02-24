import { createServer } from 'net';

export type DatafonoType = 'CABLE' | 'WIFI';

const DEFAULT_PORTS = {
  CABLE: { dev: 2001, prod: 2010 },
  WIFI: { dev: 2002, prod: 2011 }
};

class PortManager {
  private usedPorts = new Set<number>();
  private basePort = 2000;

  async findAvailablePort(): Promise<number> {
    let port = this.basePort;
    while (this.usedPorts.has(port) || !(await this.isPortAvailable(port))) {
      port++;
    }
    this.usedPorts.add(port);
    return port;
  }

  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const server = createServer();
      server.once('error', () => {
        resolve(false);
      });
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port);
    });
  }

  async getPort(type: DatafonoType, isDev = true): Promise<number> {
    // En tests, siempre usar puertos dinámicos
    if (process.env.NODE_ENV === 'test') {
      return this.findAvailablePort();
    }
    
    // En desarrollo/producción, usar puertos fijos
    return DEFAULT_PORTS[type][isDev ? 'dev' : 'prod'];
  }

  releasePort(port: number) {
    this.usedPorts.delete(port);
  }
}

export const portManager = new PortManager(); 