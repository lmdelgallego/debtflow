'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MonthSelectorProps {
  selectedDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function MonthSelector({ selectedDate, onPrevMonth, onNextMonth }: MonthSelectorProps) {
  const monthLabel = `${MONTH_NAMES_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
  const now = new Date()
  const isCurrentMonth =
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear()

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-36 text-center font-medium capitalize">{monthLabel}</span>
      <Button variant="outline" size="icon" onClick={onNextMonth} disabled={isCurrentMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
