import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { VintageItem } from '@/types/VintageItem';
import { useToast } from '@/hooks/use-toast';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: VintageItem) => void;
}

interface SuggestedFields {
  category?: string;
  year?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  currentValue?: number;
  image?: string;
}

export default function AddItemDialog({ isOpen, onClose, onAdd }: AddItemDialogProps) {
  const [newItem, setNewItem] = useState<Omit<VintageItem, 'id' | 'createdAt'>>({
    name: '',
    category: '',
    year: '',
    purchasePrice: 0,
    purchaseDate: '',
    currentValue: 0,
    image: 'https://picsum.photos/200',
  });
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'purchaseDate') {
      handleDateChange(e);
    } else if (name === 'purchasePrice' || name === 'currentValue') {
      setNewItem({ ...newItem, [name]: value === '' ? null : Number(value) });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: false });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    setNewItem({ ...newItem, purchaseDate: value });
  };

  const handleSubmit = () => {
    const errors: Record<string, boolean> = {};
    if (!newItem.name) errors.name = true;
    if (!newItem.category) errors.category = true;
    if (!newItem.year) errors.year = true;
    if (!newItem.purchasePrice) errors.purchasePrice = true;
    if (!newItem.purchaseDate) errors.purchaseDate = true;
    if (!newItem.currentValue) errors.currentValue = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onAdd({
      ...newItem,
      id: Date.now(),
      createdAt: Date.now(),
    });
    onClose();
  };

  const fetchSuggestedFields = async (productName: string): Promise<SuggestedFields> => {
    const prompt = `Inserisci le informazioni mancanti per un prodotto chiamato "${productName}". Fornisci solo le seguenti chiavi in formato JSON con esattamente questi nomi: category, year, purchasePrice, purchaseDate, currentValue, image. Assicurati che i tipi siano corretti (string per category, year, purchaseDate (dd/mm/yyyy), image(restituisci un URL diretto a  un'immagine pertinente al prodotto); number rounded (without decimals) per purchasePrice e currentValue).`;

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const headers = {
      Authorization: 'Bearer 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',
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
      throw new Error(`Impossibile ottenere i suggerimenti dal modello AI. Dettagli: ${error.message}`);
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
    if (!newItem.name.trim()) {
      toast({
        title: 'Nome prodotto mancante',
        description: 'Inserisci il nome del prodotto prima di completare automaticamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const suggestedFields = await fetchSuggestedFields(newItem.name.trim());
      console.log("Campi suggeriti dall'AI:", suggestedFields);

      setNewItem((prev) => ({
        ...prev,
        category: suggestedFields.category || prev.category,
        year: suggestedFields.year || prev.year,
        purchasePrice: suggestedFields.purchasePrice !== undefined ? suggestedFields.purchasePrice : prev.purchasePrice,
        purchaseDate: suggestedFields.purchaseDate ? formatDate(suggestedFields.purchaseDate) : prev.purchaseDate,
        currentValue: suggestedFields.currentValue !== undefined ? suggestedFields.currentValue : prev.currentValue,
        image: suggestedFields.image || prev.image,
      }));

      toast({
        title: 'Completamento AI riuscito',
        description: "I campi sono stati compilati con i suggerimenti dell'AI.",
      });
    } catch (error: any) {
      console.error('Error in handleAICompletion:', error);
      const errorMessage = error.message || 'Si è verificato un errore durante il completamento AI. Riprova più tardi.';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] p-8 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Articolo</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del nuovo articolo.<br />
            Oppure inserisci solo il Nome e clicca AI.
          </DialogDescription>
          <div className='flex flex-col pt-2 md:flex-row md:space-y-0 justify-center'>
          <Button
            onClick={handleAICompletion}
            disabled={!newItem.name || isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
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
              <Label htmlFor={key} className="text-right col-span-2 text-sm">
                {label}
              </Label>
              <Input
                id={key}
                name={key}
                type={type}
                value={newItem[key as keyof typeof newItem]}
                onChange={handleInputChange}
                className={`col-span-3 ${formErrors[key] ? 'border-red-500' : ''}`}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex flex-col space-y-4 md:flex-row md:space-y-0">
          <Button onClick={handleSubmit}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}