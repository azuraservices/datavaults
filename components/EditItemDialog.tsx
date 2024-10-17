import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { VintageItem } from '@/types/VintageItem';
import { useToast } from '@/hooks/use-toast';

interface EditItemDialogProps {
  item: VintageItem | null;
  onClose: () => void;
  onUpdate: (item: VintageItem) => void;
}

interface SuggestedFields {
  category?: string;
  year?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  currentValue?: number;
  image?: string;
}

export default function EditItemDialog({
  item,
  onClose,
  onUpdate,
}: EditItemDialogProps) {
  const [editingItem, setEditingItem] = useState<VintageItem | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setEditingItem({ ...item });
    } else {
      setEditingItem(null);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;

    const { name, value } = e.target;
    if (name === 'purchaseDate') {
      handleDateChange(e);
    } else if (name === 'purchasePrice' || name === 'currentValue') {
      setEditingItem({
        ...editingItem,
        [name]: value === '' ? 0 : Number(value),
      });
    } else {
      setEditingItem({ ...editingItem, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: false });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;

    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setEditingItem({ ...editingItem, purchaseDate: value });
  };

  const handleSubmit = () => {
    if (!editingItem) return;

    const errors: Record<string, boolean> = {};
    if (!editingItem.name) errors.name = true;
    if (!editingItem.category) errors.category = true;
    if (!editingItem.year) errors.year = true;
    if (!editingItem.purchasePrice) errors.purchasePrice = true;
    if (!editingItem.purchaseDate) errors.purchaseDate = true;
    if (!editingItem.currentValue) errors.currentValue = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onUpdate(editingItem);
    onClose();
  };

  const fetchSuggestedFields = async (
    productName: string
  ): Promise<SuggestedFields> => {
    const prompt = `Inserisci le informazioni mancanti per un prodotto chiamato "${productName}". Fornisci solo le seguenti chiavi in formato JSON con esattamente questi nomi: category, year, purchasePrice, purchaseDate, currentValue, image. Assicurati che i tipi siano corretti (string per category, year, purchaseDate (dd/mm/yyyy), image(restituisci un URL diretto a  un'immagine pertinente al prodotto); number rounded (without decimals) per purchasePrice e currentValue).`;

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
      Authorization:
        'Bearer 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',
      'Content-Type': 'application/json',
    };
    const data = {
      model: 'llama-3.2-90b-text-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 150,
      top_p: 1,
      stream: false,
      stop: null,
    };

    try {
      const response = await axios.post(url, data, { headers });
      const content = response.data.choices[0].message.content;
      console.log('Risposta API:', content);

      return parseJSONContent(content);
    } catch (error: any) {
      console.error('Error in fetchSuggestedFields:', error);
      throw new Error(
        `Impossibile ottenere i suggerimenti dal modello AI. Dettagli: ${error.message}`
      );
    }
  };

  const parseJSONContent = (content: string): SuggestedFields => {
    try {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}') + 1;
      if (start === -1 || end === -1)
        throw new Error('Formato JSON non trovato nella risposta.');

      const jsonString = content.substring(start, end);
      const parsed: SuggestedFields = JSON.parse(jsonString);

      if (
        typeof parsed.category !== 'string' ||
        typeof parsed.year !== 'string' ||
        typeof parsed.purchasePrice !== 'number' ||
        typeof parsed.purchaseDate !== 'string' ||
        typeof parsed.currentValue !== 'number' ||
        typeof parsed.image !== 'string'
      ) {
        throw new Error('Tipi di dati non validi nel JSON suggerito.');
      }

      return parsed;
    } catch (error) {
      console.error('Errore nel parsing del JSON:', error);
      throw new SyntaxError(`Errore nel parsing del JSON suggerito.`);
    }
  };

  const handleAICompletion = async () => {
    if (!editingItem || !editingItem.name.trim()) {
      toast({
        title: 'Nome prodotto mancante',
        description:
          'Inserisci il nome del prodotto prima di completare automaticamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const suggestedFields = await fetchSuggestedFields(
        editingItem.name.trim()
      );
      console.log("Campi suggeriti dall'AI:", suggestedFields);

      setEditingItem((prev: VintageItem | null) => {
        if (!prev) return null;
        return {
          ...prev,
          category: suggestedFields.category || prev.category,
          year: suggestedFields.year || prev.year,
          purchasePrice:
            suggestedFields.purchasePrice !== undefined
              ? suggestedFields.purchasePrice
              : prev.purchasePrice,
          purchaseDate: suggestedFields.purchaseDate
            ? formatDate(suggestedFields.purchaseDate)
            : prev.purchaseDate,
          currentValue:
            suggestedFields.currentValue !== undefined
              ? suggestedFields.currentValue
              : prev.currentValue,
          image: suggestedFields.image || prev.image,
        };
      });

      toast({
        title: 'Completamento AI riuscito',
        description: "I campi sono stati compilati con i suggerimenti dell'AI.",
      });
    } catch (error: any) {
      console.error('Error in handleAICompletion:', error);
      const errorMessage =
        error.message ||
        'Si è verificato un errore durante il completamento AI. Riprova più tardi.';
      setError(errorMessage);
      toast({
        title: 'Errore',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (input: string) => {
    const cleaned = input.replace(/[^\d]/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
    return match ? `${match[1]}/${match[2]}/${match[3]}` : input;
  };

  if (!editingItem) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] p-6 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle>Modifica Articolo</DialogTitle>
          <DialogDescription>
            Modifica i dettagli del tuo articolo qui.
          </DialogDescription>
          <div className='flex flex-col pt-2 md:flex-row md:space-y-0'>
          <Button
            onClick={handleAICompletion}
            disabled={!editingItem.name || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Completamento AI
          </Button>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {[
            { key: 'name', label: 'Nome', type: 'text' },
            { key: 'category', label: 'Categoria', type: 'text' },
            { key: 'year', label: 'Anno', type: 'number' },
            { key: 'purchasePrice', label: 'Prezzo di Acquisto', type: 'number' },
            { key: 'purchaseDate', label: 'Data di Acquisto', type: 'text' },
            { key: 'currentValue', label: 'Valore Attuale', type: 'number' },
            { key: 'image', label: 'URL Immagine', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key} className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor={`edit-${key}`} className="text-right col-span-2 text-sm">
                {label}
              </Label>
              <Input
                id={`edit-${key}`}
                name={key}
                type={type}
                value={editingItem[key as keyof VintageItem]}
                onChange={handleInputChange}
                className={`col-span-3 ${
                  formErrors[key] ? 'border-red-500' : ''
                } text-sm`}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex flex-col space-y-4 md:flex-row md:space-y-0">
          <Button onClick={handleSubmit}>Salva Modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
