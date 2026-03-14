import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CurrentUser } from '../common/decorators/current-user';
import type { User } from '@supabase/supabase-js';
import type { CreateDebtInput } from '@debtflow/types';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  async findPaginated(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.debtsService.findPaginated(
      user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
    );
  }

  @Get('all')
  async findAll(@CurrentUser() user: User) {
    return this.debtsService.findAll(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() input: CreateDebtInput,
  ) {
    return this.debtsService.create(user.id, input);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() input: CreateDebtInput,
  ) {
    return this.debtsService.update(user.id, id, input);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.debtsService.delete(user.id, id);
    return { success: true };
  }

  @Post(':id/pay')
  async pay(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { amount: number; createExpenseLog?: boolean },
  ) {
    await this.debtsService.pay(user.id, id, body.amount, body.createExpenseLog ?? true);
    return { success: true };
  }
}
