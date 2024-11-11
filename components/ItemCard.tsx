'use client'

import { VintageItem } from '@/types/VintageItem';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EuroIcon, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { AIIntuiter } from './ui/animatedcircles';
import AIIntuiterSwitch from './ui/switchestimator'
import AICollectorEstimator from './ui/graphestimator'

interface ItemCardProps {
  item: VintageItem;
  onEdit: (item: VintageItem) => void;
  onSell: (item: { id: number; price: number }) => void;
  onUpdateValue: (item: { id: number; currentValue: number }) => void;
  onDelete: (item: VintageItem) => void;
}

export default function ItemCard({ item, onEdit, onSell, onUpdateValue, onDelete }: ItemCardProps) {
  const calculateProfit = (item: VintageItem) =>
    item.salePrice
      ? item.salePrice - item.purchasePrice
      : item.currentValue - item.purchasePrice;

  const calculateProfitPercentage = (item: VintageItem) =>
    ((calculateProfit(item) / item.purchasePrice) * 100).toFixed(1);

  const calculateTimeSinceAcquisition = (purchaseDate: string, saleDate?: string) => {
    const start = new Date(purchaseDate.split('/').reverse().join('-'));
    const end = saleDate
      ? new Date(saleDate.split('/').reverse().join('-'))
      : new Date();
    const diffDays = Math.ceil(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 30) return `${diffDays} giorni`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mesi`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} ann${diffYears > 1 ? 'i' : 'o'}`;
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto">
      <Tabs defaultValue="details" className="w-full p-4">
        <TabsList className="grid mx-auto grid-cols-2">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="actions">Azioni</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <CardContent className="p-2 pt-6 pb-3">
            <div className="flex items-center mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg mr-4 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{item.category}</h3>
                <h2 className="text-2xl font-bold">{item.name}</h2>
                <p className="text-gray-600">{item.year}</p>
              </div>
            </div>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Prezzo di acquisto</p>
                <p className="text-lg font-bold">{item.purchasePrice} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data di acquisto</p>
                <p className="text-lg font-bold">{item.purchaseDate}</p>
              </div>
            </div>
            {/* Add AnimatedTooltip component before the profit 

            <div className='m-0 pb-4 w-full'>
              <AICollectorEstimator
                  itemDetails={{
                  name: item.name,
                  category: item.category,
                  year: item.year,
                  purchasePrice: item.purchasePrice,
                  purchaseDate: item.purchaseDate,
                  currentValue: item.currentValue,
                }}
                />
            </div>
            */}

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {item.salePrice ? 'Prezzo di vendita' : 'Valore attuale stimato'}
                </p>
                <p className="text-2xl font-bold">
                  {item.salePrice || item.currentValue} €
                </p>
              </div>
              {!item.salePrice && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateValue({ id: item.id, currentValue: item.currentValue })}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`p-4 rounded-lg ${
                calculateProfit(item) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <h4 className="text-lg font-semibold mb-2">
                {calculateProfit(item) >= 0
                  ? item.salePrice
                    ? 'Profitto realizzato'
                    : 'Profitto potenziale'
                  : item.salePrice
                  ? 'Perdita realizzata'
                  : 'Perdita potenziale'}
              </h4>
              <p
                className={`text-3xl font-bold ${
                  calculateProfit(item) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(calculateProfit(item))} €
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-bold">{calculateProfitPercentage(item)}%</span>
                {calculateProfit(item) >= 0 ? ' guadagno netto' : ' perdita netta'}{' '}
                in {calculateTimeSinceAcquisition(item.purchaseDate, item.saleDate)}
              </p>
            </div>

            {/* Add AnimatedTooltip component before the card ends */}
            

          </CardContent>
        </TabsContent>
        <TabsContent value="actions">
          <CardContent className="p-0">
            <div className="flex flex-col space-y-4 pt-6">
              <div className="flex items-center mb-2 pl-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg mr-4 object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.category}</h3>
                  <h2 className="text-2xl font-bold">{item.name}</h2>
                  <p className="text-gray-600">{item.year}</p>
                </div>
              </div>
              {!item.salePrice && (
                <Button
                  variant="outline"
                  className="w-full text-blue-600 hover:text-blue-800"
                  onClick={() => onSell({ id: item.id, price: item.currentValue })}
                >
                  <EuroIcon className="h-4 w-4 mr-2" />
                  Vendi
                </Button>
              )}
              {!item.salePrice && (
                <Button
                  variant="outline"
                  className="w-full text-blue-600 hover:text-blue-800"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-800"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
