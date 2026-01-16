'use client'

import { PageHeader } from "@/components/PageHeader"

const Page = () => {
  return (
    <>
      {/* Header */}
      <PageHeader>
        <PageHeader.Title>Gastos</PageHeader.Title>
        <PageHeader.Description>
          Administra y analiza tus gastos aquí. Agrega, edita o elimina gastos, y visualiza estadísticas detalladas para un mejor control financiero.
        </PageHeader.Description>
      </PageHeader>
    </>
  )
}

export default Page