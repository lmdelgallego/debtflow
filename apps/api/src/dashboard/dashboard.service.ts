import { Injectable } from '@nestjs/common';
import { IncomesService } from '../incomes/incomes.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DebtsService } from '../debts/debts.service';
import { calculateAvalanche } from '@debtflow/utils';

@Injectable()
export class DashboardService {
  constructor(
    private incomesService: IncomesService,
    private expensesService: ExpensesService,
    private debtsService: DebtsService,
  ) {}

  async getSummary(userId: string, date?: string) {
    const [incomes, expenses, debts] = await Promise.all([
      this.incomesService.findAll(userId, date),
      this.expensesService.findAll(userId, date),
      this.debtsService.findAll(userId),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const cashFlow = totalIncome - totalExpenses;

    const avalanche = debts.length > 0
      ? calculateAvalanche(debts, totalIncome, totalExpenses)
      : null;

    return {
      totalIncome,
      totalExpenses,
      totalDebt,
      cashFlow,
      avalanche,
    };
  }
}
