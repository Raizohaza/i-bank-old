import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto';
import { ConfigService } from 'libs/utils/src/config/configuration';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    @Inject('CUSTOMER_SERVICE')
    private readonly customerServiceClient: ClientProxy,

    @Inject('EMPLOYEE_SERVICE')
    private readonly employeeServiceClient: ClientProxy,
    private config: ConfigService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler()
    );

    const basicSecured = this.reflector.get<string[]>(
      'basicSecured',
      context.getHandler()
    );

    const empSercured = this.reflector.get<string[]>(
      'empSercured',
      context.getHandler()
    );

    if (!secured && !basicSecured && !empSercured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (basicSecured) {
      const token = request?.headers?.['x-api-key'];
      const time: string = request?.headers?.['x-time'];
      const url: Request = context.switchToHttp().getRequest().url;
      const date = new Date(Number.parseInt(time));
      const secret = this.config.get('X_SECRET');
      const now: number = Date.now();
      const expiratedTime = 60000 * 200; //200 min
      if (now - date.getTime() > expiratedTime) {
        throw new UnauthorizedException('Expirated time!');
      }
      const hash = (secret: string) =>
        crypto.createHash('sha256').update(secret).digest('hex');
      const hashToken = hash(url + time + secret);
      console.log({ url, token, hashToken, secret, time });
      if (token !== hashToken) {
        throw new BadRequestException('Invalid Token');
      }
      return true;
    }
    const token = request?.headers?.authorization?.split(' ')?.[1];
    if (!token) {
      throw new BadRequestException('Invalid Token');
    }
    const parseToken = await firstValueFrom(
      this.tokenServiceClient.send('token_decode', { token })
    );

    if (empSercured) {
      const employeeInfo = await firstValueFrom(
        this.employeeServiceClient.send('findOneEmployee', parseToken.data.uid)
      );
      if (!employeeInfo) {
        return false;
      }
      request.employee = employeeInfo.data;
      return true;
    }

    if (!parseToken || !parseToken.data) {
      throw new HttpException(
        {
          message: parseToken.message,
          data: null,
        },
        parseToken.status
      );
    }

    const customerInfo = await firstValueFrom(
      this.customerServiceClient.send('customer_get_by_id', parseToken.data.uid)
    );
    if (!customerInfo) return false;
    request.customer = customerInfo.data;
    return true;
  }
}
