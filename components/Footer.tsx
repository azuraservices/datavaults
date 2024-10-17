import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CircleHelp } from 'lucide-react';

interface FooterProps {
  onAddItem: () => void;
  onAddRandomItem: () => void;
}

export default function Footer({ onAddItem, onAddRandomItem }: FooterProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };

  return (
    <div className="flex flex-col justify-center mt-8 space-y-4">
      <div className="flex flex-wrap justify-center space-x-4">
        <Button className="flex-grow" onClick={onAddItem}>Nuovo Articolo</Button>
        <Button className="flex-grow" onClick={onAddRandomItem}>Articolo Casuale</Button>
        <CircleHelp 
          className="cursor-pointer text-black hover:text-gray-800 flex-grow-0 mt-1" 
          size={32} 
          onClick={toggleTutorial} 
        />
      </div>


      {showTutorial && (
        <div className="mt-6 text-gray-700 max-w-3xl mx-auto leading-relaxed pt-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Come usare l'applicazione</h2>
        <ul className="list-disc list-outside pl-5 space-y-4">
          <li>
            <span className="font-semibold">Aggiungi, modifica e elimina articoli: </span> 
            Gestisci facilmente una lista di articoli vintage con campi come nome, categoria, anno, prezzo d'acquisto e valore attuale.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Calcolo del profitto: </span> 
            Calcola automaticamente il profitto potenziale e le percentuali di profitto in base al prezzo di vendita e al valore attuale.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Panoramica delle statistiche: </span> 
            Visualizza statistiche come totale speso, valore attuale, profitto totale e l'articolo più redditizio.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Ricerca e filtro: </span> 
            Filtra e ordina gli articoli per categoria, stato di vendita e varie opzioni di ordinamento.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Supporto per l'archiviazione locale: </span> 
            Gli articoli vengono salvati in locale e persistono tra le sessioni.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Agenti di recupero prezzi: </span> 
            Usa 3 agenti per raccogliere, analizzare e suggerire il prezzo più probabile per articoli vintage.
          </li>
          <hr className="my-2" />
          <li>
            <span className="font-semibold">Stime Collezionista AI: </span> 
            Clicca sull'icona al centro della carta e un collezionista AI stimerà il tuo articolo.
          </li>
        </ul>
      </div>
      )}
    </div>
  );
}