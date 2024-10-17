'use client'

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VintageItem } from '@/types/VintageItem';
import Header from '../components/Header';
import SearchAndFilter from '../components/SearchAndFilter';
import ItemList from '../components/ItemList';
import StatisticsCard from '../components/StatisticsCard';
import AddItemDialog from '../components/AddItemDialog';
import EditItemDialog from '../components/EditItemDialog';
import SellItemDialog from '../components/SellItemDialog';
import UpdateValueDialog from '../components/UpdateValueDialog';
import Footer from '../components/Footer';


export default function DataVAULT() {
  const [items, setItems] = useState<VintageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<VintageItem | null>(null);
  const [sellingItem, setSellingItem] = useState<{ id: number; price: number } | null>(null);
  const [updatingValue, setUpdatingValue] = useState<{ id: number; currentValue: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedItems = localStorage.getItem('vintageItems');
    const loadedItems = savedItems ? JSON.parse(savedItems) : [];
    setItems(loadedItems);
    updateCategories(loadedItems);
  }, []);

  useEffect(() => {
    localStorage.setItem('vintageItems', JSON.stringify(items));
  }, [items]);

  const updateCategories = (items: VintageItem[]) => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category)));
    setCategories(uniqueCategories);
  };

  const addItem = (newItem: VintageItem) => {
    setItems((prevItems) => {
      const updatedItems = [newItem, ...prevItems];
      updateCategories(updatedItems);
      return updatedItems;
    });
    setIsAddingItem(false);
    toast({
      title: 'Articolo aggiunto',
      description: `${newItem.name} è stato aggiunto.`,
    });
  };

  const updateItem = (updatedItem: VintageItem) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      updateCategories(updatedItems);
      return updatedItems;
    });
    setEditingItem(null);
    toast({
      title: 'Articolo aggiornato',
      description: `${updatedItem.name} è stato aggiornato.`,
    });
  };

  const sellItem = (id: number, salePrice: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              salePrice,
              saleDate: new Date().toLocaleDateString('it-IT'),
            }
          : item
      )
    );
    setSellingItem(null);
    toast({
      title: 'Articolo venduto',
      description: `L'articolo è stato venduto per ${salePrice} €.`,
    });
  };

  const updateItemValue = (id: number, newValue: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, currentValue: newValue } : item
      )
    );
    setUpdatingValue(null);
    toast({
      title: 'Valore aggiornato',
      description: `Il valore dell'articolo è stato aggiornato a ${newValue} €.`,
    });
  };

  const deleteItem = (itemToDelete: VintageItem) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemToDelete.id));
    toast({
      title: 'Articolo eliminato',
      description: `${itemToDelete.name} è stato eliminato.`,
    });
  };

  const generateRandomItem = (): VintageItem => {
    const categories = ['Elettronica', 'Mobili', 'Arte', 'Gioielli', 'Libri'];
    const currentYear = new Date().getFullYear();
    const randomYear = Math.floor(Math.random() * (currentYear - 1900) + 1900);
    const randomPurchaseDate = new Date(
      Math.floor(
        Math.random() * (Date.now() - new Date(randomYear, 0).getTime()) +
          new Date(randomYear, 0).getTime()
      )
    );
    const randomPurchasePrice = Math.floor(Math.random() * 1000) + 50;
    const randomCurrentValue = randomPurchasePrice * (1 + Math.random() * 2);

    return {
      id: Date.now(),
      name: `Articolo ${Math.floor(Math.random() * 1000)}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      year: randomYear.toString(),
      purchasePrice: randomPurchasePrice,
      purchaseDate: randomPurchaseDate.toLocaleDateString('it-IT'),
      currentValue: Math.floor(randomCurrentValue),
      image: 'https://picsum.photos/200',
      createdAt: Date.now(),
    };
  };

  const addRandomItem = () => {
    const newItem = generateRandomItem();
    addItem(newItem);
  };

  return (
    <div className="container mx-auto p-4">
      <Header />
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        categories={categories}
      />
      <ItemList
        items={items}
        searchTerm={searchTerm}
        filterBy={filterBy}
        filterCategory={filterCategory}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onEdit={setEditingItem}
        onSell={setSellingItem}
        onUpdateValue={setUpdatingValue}
        onDelete={deleteItem}
      />
      <StatisticsCard
        items={items}
        title={filterCategory === 'all' ? 'Statistiche Generali' : `Statistiche ${filterCategory}`}
      />
      <Footer onAddItem={() => setIsAddingItem(true)} onAddRandomItem={addRandomItem} />
      <AddItemDialog
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onAdd={addItem}
      />
      <EditItemDialog
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdate={updateItem}
      />
      <SellItemDialog
        item={sellingItem}
        onClose={() => setSellingItem(null)}
        onSell={sellItem}
      />
      <UpdateValueDialog
        item={updatingValue}
        onClose={() => setUpdatingValue(null)}
        onUpdate={updateItemValue}
      />
    </div>
  );
}