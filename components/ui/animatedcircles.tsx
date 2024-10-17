"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { Star, TrendingUp, Clock, Info, BarChart2, Zap } from 'lucide-react'; 
import { cn } from "@/lib/utils";
import { animate, motion } from "framer-motion";

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

export function AIIntuiter({ itemDetails }: { itemDetails: ArticleDetails }) {
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

  const handleCardClick = async () => {
    if (loading) return; 
    if (clickCount >= MAX_CLICKS) {
      alert('Hai raggiunto il limite di clic per oggi. Riprova domani.');
      return;
    }

    setIsContentVisible(prevState => !prevState);

    if (!isContentVisible) {
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
    }
  };

  const remainingClicks = MAX_CLICKS - clickCount;

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
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none opacity-60"
          aria-label="Informazioni sui clic disponibili"
        >
          <Info className="w-4 h-4 text-gray-800 dark:text-gray-200" />
        </button>
        {isTooltipVisible && (
          <div className="absolute top-full transform right-2 mt-2 w-48 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
            <p className="text-sm text-gray-800 dark:text-gray-200">Stima il tuo articolo utilizzando un Collezionista AI.</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 mt-2 mb-2"></p>
            <p className="text-sm text-gray-800 dark:text-gray-200">Clic rimanenti oggi: {remainingClicks}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Si resetterà il: {formattedResetTime}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 mt-0 mr-0 z-20">
        <InfoIcon remainingClicks={remainingClicks} resetTime={resetTime} />
      </div>

      <button
        onClick={handleCardClick}
        className={`w-full text-left cursor-pointer ${clickCount >= MAX_CLICKS ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={clickCount >= MAX_CLICKS || loading}
      >
        <CardSkeletonContainer>
          <Skeleton />
        </CardSkeletonContainer>
      </button>

      {isContentVisible && (
        <div className="mt-4 pb-8">
          {loading ? (
            <div className=" text-sm text-gray-600 flex justify-center items-center">Un collezionista AI sta stimando il tuo articolo...</div>
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

const Skeleton = () => {
  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2 mt-2">
        <Container className="h-8 w-8 circle-1 border-2 border-gray-200">
          <Star className="w-4 h-4 text-yellow-500" /> {/* Icona colorata */}
        </Container>
        <Container className="h-12 w-12 circle-2 border-2 border-gray-200">
          <Clock className="h-6 w-6 text-orange-500" /> {/* Icona colorata */}
        </Container>
        <Container className="circle-3 border-2 border-gray-200">
          <TrendingUp className="h-8 w-8 text-green-500" /> {/* Icona colorata */}
        </Container>
        <Container className="h-12 w-12 circle-4 border-2 border-gray-200">
          <BarChart2 className="h-6 w-6 text-purple-500" /> {/* Icona colorata */}
        </Container>
        <Container className="h-8 w-8 circle-5 border-2 border-gray-200">
          <Zap className="h-4 w-4 text-blue-500" /> {/* Icona colorata */}
        </Container>
      </div>

      <motion.div
        className="h-40 w-px absolute top-18 m-auto z-40 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
        animate={{ x: [-130, 130] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-10 h-40 top-1/2 -translate-y-1/2 absolute -left-10">
          <Sparkles />
        </div>
      </motion.div>
    </div>
  );
};

const Sparkles = () => {
  const sparkles = useRef(
    Array.from({ length: 12 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random(),
      duration: Math.random() * 2 + 4,
      move: Math.random() * 2 - 1,
    }))
  ).current;

  return (
    <div className="absolute inset-0">
      {sparkles.map((sparkle, i) => (
        <motion.span
          key={`sparkle-${i}`}
          animate={{
            top: `calc(${sparkle.top} + ${sparkle.move}px)`,
            left: `calc(${sparkle.left} + ${sparkle.move}px)`,
            opacity: sparkle.opacity,
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: `2px`,
            height: `2px`,
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block bg-black dark:bg-white"
        ></motion.span>
      ))}
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
              className="ml-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 opacity-60"
              aria-label={`Informazioni su ${factor.name}`}
            >
              <Info className="w-4 h-4 text-gray-800 dark:text-gray-200" />
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

export const CardSkeletonContainer = ({
  className,
  children,
  showGradient = true,
}: {
  className?: string;
  children: React.ReactNode;
  showGradient?: boolean;
}) => {
  return (
    <div
      className={cn(
        "h-[6rem] md:h-[6rem] rounded-xl z-40 mb-8",
        className,
        showGradient &&
          "bg-neutral-100 dark:bg-[rgba(40,40,40,0.70)] [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]"
      )}
    >
      {children}
    </div>
  );
};

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        `h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
    `,
        className
      )}
    >
      {children}
    </div>
  );
};