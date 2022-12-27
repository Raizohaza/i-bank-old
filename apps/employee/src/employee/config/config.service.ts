import { Transport } from '@nestjs/microservices';

export class ConfigService {
  private readonly envConfig: { [key: string]: unknown } = null;

  constructor() {
    this.envConfig = {
      port: process.env.ACCOUNT_SERVICE_PORT,
    };
    this.envConfig.baseUri = process.env.BASE_URI;
    this.envConfig.gatewayPort = process.env.API_GATEWAY_PORT;
  }

  get(key: string): unknown {
    return this.envConfig[key];
  }
}