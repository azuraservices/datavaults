'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';

interface UpdateValueDialogProps {
  item: { id: number; currentValue: number } | null;
  onClose: () => void;
  onUpdate: (id: number, newValue: number) => void;
}

export default function UpdateValueDialog({ item, onClose, onUpdate }: UpdateValueDialogProps) {
  const [updatingValue, setUpdatingValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent1Status, setAgent1Status] = useState<'idle' | 'loading' | 'complete'>('idle');

  useEffect(() => {
    if (item) {
      setUpdatingValue(item.currentValue);
    }
  }, [item]);

  const handleSubmit = () => {
    if (item) {
      onUpdate(item.id, updatingValue);
      onClose();
    }
  };

  const findSuggestedPrice = async () => {
    setIsLoading(true);
    setError(null);
    setAgent1Status('loading');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setAgent1Status('complete');
    setUpdatingValue(Math.floor(Math.random() * 1000) + 100); // Random suggested price
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] p-6 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle>Aggiorna Valore Attuale</DialogTitle>
          <DialogDescription>
            Aggiorna il valore attuale dell'articolo o usa il prezzo suggerito.
          </DialogDescription>
          <div className='flex flex-col pt-2 md:flex-row md:space-y-0'>
          <Button
            onClick={findSuggestedPrice}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Caricamento...' : 'Trova Prezzo'}
          </Button>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-2 mb-2">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="current-value" className="text-right col-span-2 text-sm">
              Valore Attuale
            </Label>
            <Input
              id="current-value"
              type="number"
              value={updatingValue}
              onChange={(e) => setUpdatingValue(Number(e.target.value))}
              className="col-span-3"
              placeholder="es. 350"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="space-y-2 mt-2">
            <div className="flex items-center">
              <span className="mr-2">Ricerca del prezzo online</span>
              {agent1Status === 'idle' ? (
                <AlertCircle className="h-4 w-4 text-gray-400" />
              ) : agent1Status === 'loading' ? (
                <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Aggiorna Valore</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}