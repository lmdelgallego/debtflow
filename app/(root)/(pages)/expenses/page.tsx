'use client'

import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoveUpRight } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];
const Page = () => {
  const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
  ];

  const top3CategoryData = [
    { name: 'Groceries', value: 450000, percentage: 40 },
    { name: 'Rent', value: 375000, percentage: 30 },
    { name: 'Transport', value: 250000, percentage: 20 },
  ];

  const expensesData = [
    {
      category: {
        id: 1,
        name: 'Groceries',
        color: '#dc2626',
        emoji: '🛒'
      },
      label: 'Groceries',
      value: 450000,
      percentage: 40
    },
    {
      category: {
        id: 2,
        name: 'Rent',
        color: '#ef4444',
        emoji: '🏠'
      },
      label: 'Rent',
      value: 3750000,
      percentage: 30
    },
    {
      category: {
        id: 3,
        name: 'Transport',
        color: '#f87171',
        emoji: '🚗'
      },
      label: 'Transport',
      value: 250000,
      percentage: 20
    },
    {
      category: {
        id: 4,
        name: 'Health',
        color: '#fca5a5',
        emoji: '🏥'
      },
      label: 'Health',
      value: 650000,
      percentage: 20
    }
  ];


  return (
    <>
      {/* Header */}
      <PageHeader>
        <PageHeader.Title>Gastos</PageHeader.Title>
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
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 max-sm:col-span-2">
          <h3 className="text-xl font-semibold">Top 3 Categorías</h3>
          {top3CategoryData.map((category, index) => (
            <div
                key={category.name}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="font-medium text-gray-700">#{index + 1} {category.name}</span>
                </div>
                <p className="text-3xl font-bold text-red-600">${category.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{category.percentage}% of total</p>
              </div>
            ))}

        </div>

        <section className="flex justify-around gap-6 col-span-2">
          {expensesData.map((item, index) => (
            <div key={item.category.id} className="flex flex-col">
              <h4 className="font-medium text-gray-700">{item.category.emoji} {item.category.name}</h4>
              <span className="font-bold text-2xl text-gray-700">$ {item.value.toLocaleString()}</span>
              <span className="flex text-sm items-center gap-2 font-medium text-gray-400"><MoveUpRight className="text-green-600" size={16} />{item.percentage}%</span>
            </div>
          ))}
        </section>

        <Card className="col-span-2">
          <CardContent>
            { /* Tabla de gastos */ }
            La tabla de gastos va aquí
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default Page