'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SellItemDialogProps {
  item: { id: number; price: number } | null;
  onClose: () => void;
  onSell: (id: number, price: number) => void;
}

export default function SellItemDialog({ item, onClose, onSell }: SellItemDialogProps) {
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  useEffect(() => {
    if (item) {
      setSellingPrice(item.price);
    }
  }, [item]);

  const handleSubmit = () => {
    if (item) {
      onSell(item.id, sellingPrice);
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vendi Articolo</DialogTitle>
          <DialogDescription>
            Inserisci il prezzo di vendita dell'articolo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="sale-price" className="text-right col-span-2">
              Prezzo di Vendita
            </Label>
            <Input
              id="sale-price"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="col-span-3"
              placeholder="es. 350"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Conferma Vendita</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}