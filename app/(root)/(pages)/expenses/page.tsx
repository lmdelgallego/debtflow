'use client'

import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, MoveDownRight, MoveUpRight, Pencil, Trash2 } from "lucide-react";
import { Cell, Pie, PieChart, PieLabelRenderProps, ResponsiveContainer, Tooltip, TooltipContentProps } from "recharts"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import NewExpense from "@/components/expenses/new-expense";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#ec4899'];

const CATEGORIES = [
  { id: 1, name: 'Groceries', color: COLORS[0], emoji: '🛒' },
  { id: 2, name: 'Housing', color: COLORS[1], emoji: '🏠' },
  { id: 3, name: 'Utilities', color: COLORS[2], emoji: '💡' },
  { id: 4, name: 'Transport', color: COLORS[3], emoji: '🚗' },
  { id: 5, name: 'Entertainment', color: COLORS[4], emoji: '🎬' },
  { id: 6, name: 'Health', color: COLORS[5], emoji: '🏥' },
];

const CustomLabel = ({ payload }: PieLabelRenderProps) => {
  return (
    <div className="">
          <p className="label">{`${payload.category?.emoji} ${payload.category?.name} : ${payload.value}`}</p>
          <p className="intro">{payload.label}</p>
          <p className="desc">{payload.percentage}%</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<string | number, string>) => {
  const content = payload[0]?.payload
  return (
    <div className="flex flex-col gap-2 p-2 border border-gray-200 rounded-lg shadow bg-white">
          <p className="label">{`${content?.category?.emoji} ${content?.category?.name}`}</p>
          <p className="intro">$ {Number(content?.value).toLocaleString()}</p>
          <p className="desc">{content?.percentage}% de gastos</p>

    </div>
  );
};


const expensesData = [
  {
    id: 1,
    category: 1,
    label: 'Compra en Jumbo',
    value: 450000,
    date: '2026-01-22'
  },
  {
    id: 2,
    category: 2,
    label: 'Arriendo',
    value: 3750000,
    date: '2026-01-22'
  },
  {
    id: 3,
    category: 3,
    label: 'Gasolina',
    value: 250000,
    date: '2026-01-22'
  },
  {
    id: 4,
    category: 4,
    label: 'Seguro Sura',
    value: 650000,
    date: '2026-01-22'
  },
  {
    id: 5,
    category: 2,
    label: 'ETB - Pago Internet',
    value: 129900,
    date: '2026-01-22'
  },

];
const totalExpenses = expensesData.reduce((total, expense) => total + expense.value, 0);

const data = expensesData.map((expense) => ({
  ...expense,
  category: CATEGORIES.find((category) => category.id === expense.category),
  percentage: Number(((expense.value / totalExpenses) * 100).toFixed(0))
}));


const top3ExpensesData = data.sort((a, b) => b.value - a.value).slice(0, 3);
const Page = () => {

  const editHandler = (id: number) => {
    console.log('edit', id)
  }

  const deleteHandler = (id: number) => {
    console.log('delete', id)
  }

  return (
    <>
      {/* Header */}
      <PageHeader>
        <PageHeader.Title >
          <div className="flex items-center justify-between gap-2">
            Gastos
            <span className="text-red-600">Total: ${totalExpenses.toLocaleString()}</span>
          </div>
        </PageHeader.Title>
        <PageHeader.Description>
          Administra y analiza tus gastos aquí. Agrega, edita o elimina gastos, y visualiza estadísticas detalladas para un mejor control financiero.
        </PageHeader.Description>
      </PageHeader>

      <main className="grid grid-cols-2 gap-6">
        <Card className="max-sm:col-span-2">
          <CardHeader>
            <CardTitle>Total gastado este mes</CardTitle>
          </CardHeader>
          <CardContent>

            <ResponsiveContainer width="100%" height={350}>
              <PieChart >
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="80%"
                  outerRadius="100%"
                  cornerRadius="50%"
                  fill="#8884d8"
                  paddingAngle={5}
                  // label
                  label={CustomLabel}
                  // dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.category?.color} />
                ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
              </PieChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 max-sm:col-span-2">
          <h3 className="text-xl font-semibold">Top 3 Categorías</h3>
          {top3ExpensesData.map((expense, index) => (
            <Card
                key={expense.id}
            >
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-700">#{index + 1} </span>
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: expense.category?.color }}></div>
                  <span>{expense.category?.emoji} {expense.label}</span>
                </div>
                <p className="text-3xl font-bold text-red-600">${expense.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{expense.percentage}% of total</p>
                </CardContent>
            </Card>
            ))}

        </div>

        <section className="flex justify-around gap-6 col-span-2">
          {data.sort((a, b) => a.value - b.value).slice(0,4).map((item) => (
            <div key={item.id} className="flex flex-col">
              <h4 className="font-medium text-gray-700">{item.category?.emoji} {item.label}</h4>
              <span className="font-bold text-2xl text-gray-700">$ {item.value.toLocaleString()}</span>
              {/* Porcentaje de crecimiento o disminución con respecto al mes anterior, si fue menor se muestra en verde y se fue mayor en rojo, y el porcentaje se muestra en negrita, y si es igual a 0 se muestra en gris */}
              {item.percentage < 0 ? (
                <span className="flex text-sm items-center gap-2 font-medium text-gray-400">
                  <MoveDownRight className="text-green-600" size={16} />{item.percentage}%
                </span>
              ) : item.percentage > 0 ? (
                <span className="flex text-sm items-center gap-2 font-medium text-gray-400">
                  <MoveUpRight className="text-red-600" size={16} />{item.percentage}%
                </span>
              ) : (
                <span className="flex text-sm items-center gap-2 font-medium text-gray-400">
                  <Minus className="text-gray-400" size={16} />{item.percentage}%
                </span>
              )}
            </div>
          ))}
        </section>

        <Card className="col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Historial de Gastos</h3>
              <NewExpense />
            </div>
            <Table>
              <TableCaption>A list of recent invoices.</TableCaption>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.category?.emoji} {item.category?.name}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell className="text-right"> - $ {item.value.toLocaleString()}</TableCell>
                    <TableCell >
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 hover:bg-gray-50" onClick={() => editHandler(item.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteHandler(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default Page