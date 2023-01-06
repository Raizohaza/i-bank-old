import { Module } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from 'libs/utils/src/config/configuration';
import { ReceiverController } from './receiver/receiver.controller';
import { CustomerController } from './customer/customer.controller';
import { AccountController } from './account/account.controller';
import { TransactionController } from './transaction/transaction.controller';
import { LinkingBanksController } from './linking-banks/linking-banks.controller';
import { EmployeeController } from './employee/employee.controller';
@Module({
  imports: [ConfigService],
  controllers: [
    ReceiverController,
    CustomerController,
    AccountController,
    TransactionController,
    LinkingBanksController,
    EmployeeController,
  ],
  providers: [
    ConfigService,
    {
      provide: 'CONFIG_SERVICE',
      useClass: ConfigService,
    },
    {
      provide: 'CUSTOMER_SERVICE',
      useFactory: (configService: ConfigService) => {
        const customerServiceOptions = configService.get('customerService');
        return ClientProxyFactory.create(customerServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'TOKEN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const tokenServiceOptions = configService.get('tokenService');
        return ClientProxyFactory.create(tokenServiceOptions);
      },
      inject: [ConfigService],
    },
    {
      provide: 'ACCOUNT_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.get('accountService'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'RECEIVER_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.get('receiverService'));
      },
      inject: [ConfigService],
    },
    {
      provide: 'TRANSACTION_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          configService.get('transactionService')
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'LINKING_BANKS_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(
          configService.get('linkingBankService')
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'EMPLOYEE_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.get('employeeService'));
      },
      inject: [ConfigService],
    },
  ],
})
export class RpcServicesModule {}
