import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CurrentUser } from '../common/decorators/current-user';
import type { User } from '@supabase/supabase-js';
import type { CreateIncomeInput } from '@debtflow/types';

@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get()
  async findPaginated(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('date') date?: string,
  ) {
    return this.incomesService.findPaginated(
      user.id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10,
      date,
    );
  }

  @Get('all')
  async findAll(
    @CurrentUser() user: User,
    @Query('date') date?: string,
  ) {
    return this.incomesService.findAll(user.id, date);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() input: CreateIncomeInput,
  ) {
    return this.incomesService.create(user.id, input);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() input: CreateIncomeInput,
  ) {
    return this.incomesService.update(user.id, id, input);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.incomesService.delete(user.id, id);
    return { success: true };
  }
}
