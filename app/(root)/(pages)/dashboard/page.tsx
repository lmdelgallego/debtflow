import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Usuarios</h2>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+12% desde el mes pasado</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Ventas</h2>
          <p className="text-3xl font-bold text-green-600">$12,345</p>
          <p className="text-sm text-gray-500 mt-1">+8% desde el mes pasado</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Pedidos</h2>
          <p className="text-3xl font-bold text-purple-600">567</p>
          <p className="text-sm text-gray-500 mt-1">+5% desde el mes pasado</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
