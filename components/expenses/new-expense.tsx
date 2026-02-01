'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Label } from '@/components/ui/label';
import { Input } from "../ui/input";

export default function NewExpense() {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button>
                        <Plus size={16} />Agregar Gasto
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Gasto</DialogTitle>
                        <DialogDescription>
                            Llena el formulario para agregar un nuevo gasto a tu lista.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        {/* Form fields go here */}
                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoría</label>
                            <select
                                id="category"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="food">🏠 Casa</option>
                                <option value="transport">🚗 Transporte</option>
                                <option value="entertainment">🎮 Entretenimiento</option>
                                <option value="utilities">💡 Servicios</option>
                                <option value="others">📦 Otros</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoría</label>
                            <select
                                id="category"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="food">Arriendo</option>
                                <option value="transport">Factura ETB</option>
                                <option value="transport">Factura LUX</option>
                                <option value="transport">Factura GAS</option>
                                <option value="transport">Factura Agua</option>
                                <option value="transport">+ Agregar</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Descripción</label>
                            <input
                                type="text"
                                id="label"
                                placeholder="Ej: Compra en supermercado"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Monto</Label>
                            <Input
                                type="number"
                                id="amount"
                                placeholder="Ej: 50000"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Fecha</label>
                            <input
                                type="date"
                                id="date"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoría</label>
                            <select
                                id="category"
                                className="bg-transparent border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="food">Comida</option>
                                <option value="transport">Transporte</option>
                                <option value="entertainment">Entretenimiento</option>
                                <option value="utilities">Servicios</option>
                                <option value="others">Otros</option>
                            </select>
                        </div>

                    </div>
                    <DialogFooter>
                        <DialogClose>
                            <Button variant={'outline'}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" >Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}