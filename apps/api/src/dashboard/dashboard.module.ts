import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IncomesModule } from '../incomes/incomes.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { DebtsModule } from '../debts/debts.module';

@Module({
  imports: [IncomesModule, ExpensesModule, DebtsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
