'use client'

import { motion } from 'framer-motion';
import { VintageItem } from '@/types/VintageItem';
import ItemCard from './ItemCard';

interface ItemListProps {
  items: VintageItem[];
  searchTerm: string;
  filterBy: string;
  filterCategory: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onEdit: (item: VintageItem) => void;
  onSell: (item: { id: number; price: number }) => void;
  onUpdateValue: (item: { id: number; currentValue: number }) => void;
  onDelete: (item: VintageItem) => void;
}

export default function ItemList({
  items,
  searchTerm,
  filterBy,
  filterCategory,
  sortBy,
  sortOrder,
  onEdit,
  onSell,
  onUpdateValue,
  onDelete,
}: ItemListProps) {
  const filteredAndSortedItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      if (filterBy === 'all') return true;
      if (filterBy === 'sold') return item.salePrice !== undefined;
      if (filterBy === 'unsold') return item.salePrice === undefined;
      return true;
    })
    .filter(
      (item) => filterCategory === 'all' || item.category === filterCategory
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'profit')
        comparison = calculateProfit(b) - calculateProfit(a);
      else if (sortBy === 'date')
        comparison =
          new Date(b.purchaseDate.split('/').reverse().join('-')).getTime() -
          new Date(a.purchaseDate.split('/').reverse().join('-')).getTime();
      else if (sortBy === 'percentage')
        comparison =
          Number(calculateProfitPercentage(b)) -
          Number(calculateProfitPercentage(a));
      else if (sortBy === 'createdAt') comparison = b.createdAt - a.createdAt;

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {filteredAndSortedItems.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onSell={onSell}
          onUpdateValue={onUpdateValue}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
}

const calculateProfit = (item: VintageItem) =>
  item.salePrice
    ? item.salePrice - item.purchasePrice
    : item.currentValue - item.purchasePrice;

const calculateProfitPercentage = (item: VintageItem) =>
  ((calculateProfit(item) / item.purchasePrice) * 100).toFixed(1);