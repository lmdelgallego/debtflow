import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CurrentUser } from '../common/decorators/current-user';
import type { User } from '@supabase/supabase-js';
import type { CreateExpenseInput } from '@debtflow/types';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findPaginated(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('date') date?: string,
  ) {
    return this.expensesService.findPaginated(
      user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      date,
    );
  }

  @Get('all')
  async findAll(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    return this.expensesService.findAll(user.id, date);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() input: CreateExpenseInput,
  ) {
    return this.expensesService.create(user.id, input);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() input: CreateExpenseInput,
  ) {
    return this.expensesService.update(user.id, id, input);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.expensesService.delete(user.id, id);
    return { success: true };
  }

  @Post('sync-recurring')
  async syncRecurring(@CurrentUser() user: User) {
    return this.expensesService.syncRecurring(user.id);
  }
}
