'use client'

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VintageItem } from '@/types/VintageItem';

interface StatisticsCardProps {
  items: VintageItem[];
  title: string;
}

export default function StatisticsCard({ items, title }: StatisticsCardProps) {
  const stats = useMemo(() => {
    const soldItems = items.filter((item) => item.salePrice).length;
    const unsoldItems = items.length - soldItems;
    const totalSpent = items.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + (item.salePrice || item.currentValue),
      0
    );
    const totalProfit = items.reduce(
      (sum, item) =>
        sum + (item.salePrice || item.currentValue) - item.purchasePrice,
      0
    );
    const averageProfit = items.length > 0 ? totalProfit / items.length : 0;
    const mostProfitableItem =
      items.length > 0
        ? items.reduce(
            (max, item) =>
              (item.salePrice || item.currentValue) - item.purchasePrice >
              (max.salePrice || max.currentValue) - max.purchasePrice
                ? item
                : max,
            items[0]
          )
        : null;

    return {
      soldItems,
      unsoldItems,
      totalSpent,
      totalValue,
      totalProfit,
      averageProfit,
      mostProfitableItem,
    };
  }, [items]);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto mt-12">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Articoli Venduti</p>
            <p className="text-lg font-bold">{stats.soldItems}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Articoli Non Venduti</p>
            <p className="text-lg font-bold">{stats.unsoldItems}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Totale Speso</p>
            <p className="text-lg font-bold">{stats.totalSpent.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stima Valore Totale</p>
            <p className="text-lg font-bold">{stats.totalValue.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profitto Totale</p>
            <p className="text-lg font-bold">
              {stats.totalProfit.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profitto Medio</p>
            <p className="text-lg font-bold">
              {stats.averageProfit.toFixed(2)} €
            </p>
          </div>
        </div>
        {stats.mostProfitableItem && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Articolo Più Profittevole</p>
            <p className="text-lg font-bold">{stats.mostProfitableItem.name}</p>
            <p className="text-sm text-gray-600">
              Profitto:{' '}
              {(
                (stats.mostProfitableItem.salePrice ||
                  stats.mostProfitableItem.currentValue) -
                stats.mostProfitableItem.purchasePrice
              ).toFixed(2)}{' '}
              €
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
