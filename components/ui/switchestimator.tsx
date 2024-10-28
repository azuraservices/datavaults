"use client";

import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Star, TrendingUp, Clock, BarChart2, Info } from 'lucide-react'; 
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface IntuitionFactor {
  name: string;
  score: string;
  icon: React.ReactNode;
}

interface ArticleDetails {
  name: string;
  category: string;
  year: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
}

interface EstimationResponse {
  rarity: string;
  marketDemand: string;
  longevity: string;
  marketTrends: string;
}

export default function AIIntuiterSwitch({ itemDetails }: { itemDetails: ArticleDetails }) {
  const [isChecked, setIsChecked] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [factors, setFactors] = useState<IntuitionFactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [resetTime, setResetTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const MAX_CLICKS = 20;

  useEffect(() => {
    const storedClicks = localStorage.getItem('clickCount');
    const storedReset = localStorage.getItem('resetTime');

    if (storedClicks && storedReset) {
      const now = new Date();
      const resetDate = new Date(storedReset);

      if (now >= resetDate) {
        setClickCount(0);
        const nextReset = new Date();
        nextReset.setDate(now.getDate() + 1);
        setResetTime(nextReset.toISOString());
        localStorage.setItem('clickCount', '0');
        localStorage.setItem('resetTime', nextReset.toISOString());
      } else {
        setClickCount(parseInt(storedClicks, 10));
        setResetTime(storedReset);
      }
    } else {
      const nextReset = new Date();
      nextReset.setDate(nextReset.getDate() + 1);
      setResetTime(nextReset.toISOString());
      localStorage.setItem('clickCount', '0');
      localStorage.setItem('resetTime', nextReset.toISOString());
    }
  }, []);

  const updateClickData = (newCount: number) => {
    setClickCount(newCount);
    localStorage.setItem('clickCount', newCount.toString());
  };

  const handleSwitchChange = async (checked: boolean) => {
    setIsChecked(checked);
    if (checked) {
      if (clickCount >= MAX_CLICKS) {
        alert('Hai raggiunto il limite di clic per oggi. Riprova domani.');
        setIsChecked(false);
        return;
      }

      setIsContentVisible(true);
      setLoading(true);
      setError(null);
      try {
        const estimation = await fetchCollectibleEstimation(itemDetails);
        setFactors([
          { name: "Rarità", score: estimation.rarity, icon: <Star className="w-4 h-4 text-yellow-500" /> },
          { name: "Domanda di Mercato", score: estimation.marketDemand, icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
          { name: "Longevità", score: estimation.longevity, icon: <Clock className="w-4 h-4 text-orange-500" /> },
          { name: "Tendenze di Mercato", score: estimation.marketTrends, icon: <BarChart2 className="w-4 h-4 text-purple-500" /> },
        ]);
        updateClickData(clickCount + 1);
      } catch (error) {
        console.error('Errore durante il recupero della stima:', error);
        setError('Impossibile recuperare i dati di stima. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    } else {
      setIsContentVisible(false);
    }
  };

  const remainingClicks = MAX_CLICKS - clickCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-md relative">
        <div className="space-y-0.5">
          <Label htmlFor="ai-intuiter" className="text-base font-medium">
            Il Collezionista
          </Label>
          <p className="text-sm text-muted-foreground">
            Scopri dettagli utili sul tuo articolo.
          </p>
          <div className="flex flex-row pl-10 mt-2 pt-4 items-center justify-between">
            <Star className="w-4 h-4 text-yellow-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
            <Clock className="w-4 h-4 text-orange-500" />
            <BarChart2 className="w-4 h-4 text-purple-500" />
          </div>
        </div>
        <div className="flex items-center">
          <Switch
            id="ai-intuiter"
            checked={isChecked}
            onCheckedChange={handleSwitchChange}
            disabled={clickCount >= MAX_CLICKS || loading}
          />
        </div>
        <div className="absolute top-3 right-3">
          <InfoIcon remainingClicks={remainingClicks} resetTime={resetTime} />
        </div>
      </div>
      {isContentVisible && (
        <div className="mt-4 pb-8">
          {loading ? (
            <div className="text-sm text-gray-600 flex justify-center items-center">Un collezionista AI sta stimando il tuo articolo...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <CollectorsIntuition factors={factors} />
          )}
        </div>
      )}
    </div>
  );
}

const InfoIcon: React.FC<{ remainingClicks: number; resetTime: string }> = ({ remainingClicks, resetTime }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const formattedResetTime = new Date(resetTime).toLocaleString();

  const toggleTooltip = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsTooltipVisible(!isTooltipVisible);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleTooltip}
        className="p-1 rounded-full dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none border border-gray-200"
        aria-label="Informazioni sui clic disponibili"
      >
        <Info className="w-3 h-3 text-gray-800 dark:text-gray-200" />
      </button>
      {isTooltipVisible && (
        <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
          <p className="text-xs text-gray-800 dark:text-gray-200">Stima il tuo articolo utilizzando un Collezionista AI.</p>
          <p className="text-xs text-gray-800 dark:text-gray-200">Clic rimanenti oggi: {remainingClicks}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Si resetterà il: {formattedResetTime}</p>
        </div>
      )}
    </div>
  );
};

const CollectorsIntuition = ({ factors }: { factors: IntuitionFactor[] }) => {
  const [infoVisible, setInfoVisible] = useState<{ [key: string]: boolean }>({});

  const handleInfoClick = (factorName: string) => {
    setInfoVisible((prev) => ({ ...prev, [factorName]: !prev[factorName] }));
  };

  const getInfoContent = (factorName: string) => {
    switch (factorName) {
      case "Rarità":
        return "La rarità indica quanto è comune o raro un oggetto. Valori possibili: Comune, Non comune, Raro, Leggendario.";
      case "Domanda di Mercato":
        return "La domanda di mercato rappresenta quanto è richiesto un oggetto attualmente.";
      case "Longevità":
        return "La longevità misura quanto un oggetto può mantenere il suo valore nel tempo.";
      case "Tendenze di Mercato":
        return "Le tendenze di mercato indicano come sta cambiando il valore di un oggetto nel tempo.";
      default:
        return "Nessuna informazione disponibile.";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {factors.map((factor, index) => (
        <div key={index} className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            {factor.icon}
            <span className={cn("text-sm text-gray-600")}>{factor.name}</span>
          </div>
          <div className="flex items-center gap-2 relative">
            <span className={cn("text-sm font-semibold")}>{factor.score}</span>
            <button
              onClick={() => handleInfoClick(factor.name)}
              className="ml-2 p-1 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 "
              aria-label={`Informazioni su ${factor.name}`}
            >
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-200" />
            </button>
            {infoVisible[factor.name] && (
              <div className="absolute right-2 top-full transform mt-2 w-64 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {getInfoContent(factor.name)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
      <hr className="mt-4 border-gray-200 dark:border-gray-700" />
    </div>
  );
};

const fetchCollectibleEstimation = async (articleDetails: ArticleDetails): Promise<EstimationResponse> => {
  const prompt = `Usa questi dettagli per stimare la rarità, la domanda di mercato, la longevità e le tendenze di mercato di un articolo:
Nome: ${articleDetails.name}
Categoria: ${articleDetails.category}
Anno: ${articleDetails.year}
Prezzo d'acquisto: ${articleDetails.purchasePrice}
Data d'acquisto: ${articleDetails.purchaseDate}
Valore attuale: ${articleDetails.currentValue}

OUTPUT ONLY JSON: rarity, marketDemand, longevity, marketTrends. NO OTHER TEXT`;

  console.log("Prompt inviato:", prompt);

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    Authorization: 'Bearer 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',
    'Content-Type': 'application/json',
  };
  const data = {
    model: 'llama-3.2-90b-text-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 100,
    top_p: 1,
    stream: false,
  };

  try {
    const response = await axios.post(url, data, { headers });
    const content = response.data.choices[0].message.content;
    console.log('Risposta API:', content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching estimation:', error);
    throw new Error('API request failed');
  }
};