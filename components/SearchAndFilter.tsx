'use client'

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SortAsc, SortDesc } from 'lucide-react';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterBy: string;
  setFilterBy: (filter: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  categories: string[];
}

export default function SearchAndFilter({
  searchTerm,
  setSearchTerm,
  filterBy,
  setFilterBy,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categories,
}: SearchAndFilterProps) {
  return (
    <div className="mb-6 space-y-4 max-w-3xl mx-auto">
      <Input
        placeholder="Cerca tra i tuoi articoli..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:flex-grow">
            <SelectValue placeholder="Filtra articoli" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli articoli</SelectItem>
            <SelectItem value="sold">Articoli venduti</SelectItem>
            <SelectItem value="unsold">Articoli non venduti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:flex-grow">
            <SelectValue placeholder="Filtra per categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:flex-grow">
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Data di inserimento</SelectItem>
            <SelectItem value="profit">Profitto potenziale</SelectItem>
            <SelectItem value="date">Data di acquisto</SelectItem>
            <SelectItem value="percentage">% di guadagno</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-full sm:flex-grow"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}