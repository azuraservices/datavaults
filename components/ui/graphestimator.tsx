"use client"

import React, { useEffect, useState } from "react"
import axios from 'axios'
import { Star, TrendingUp, Clock, BarChart2, Info } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

interface IntuitionFactor {
  name: string;
  score: number;
  icon: React.ReactElement;
  color: string;
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
  rarity: number;
  marketDemand: number;
  longevity: number;
  marketTrends: number;
}

export default function AICollectorEstimator({ itemDetails }: { itemDetails: ArticleDetails }) {
  const [factors, setFactors] = useState<IntuitionFactor[]>([])
  const [loading, setLoading] = useState(false)
  const [clickCount, setClickCount] = useState<number>(0)
  const [resetTime, setResetTime] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const MAX_CLICKS = 20

  useEffect(() => {
    const storedClicks = localStorage.getItem('clickCount')
    const storedReset = localStorage.getItem('resetTime')

    if (storedClicks && storedReset) {
      const now = new Date()
      const resetDate = new Date(storedReset)

      if (now >= resetDate) {
        setClickCount(0)
        const nextReset = new Date()
        nextReset.setDate(now.getDate() + 1)
        setResetTime(nextReset.toISOString())
        localStorage.setItem('clickCount', '0')
        localStorage.setItem('resetTime', nextReset.toISOString())
      } else {
        setClickCount(parseInt(storedClicks, 10))
        setResetTime(storedReset)
      }
    } else {
      const nextReset = new Date()
      nextReset.setDate(nextReset.getDate() + 1)
      setResetTime(nextReset.toISOString())
      localStorage.setItem('clickCount', '0')
      localStorage.setItem('resetTime', nextReset.toISOString())
    }
  }, [])

  const updateClickData = (newCount: number) => {
    setClickCount(newCount)
    localStorage.setItem('clickCount', newCount.toString())
  }

  const handleEstimateClick = async () => {
    if (clickCount >= MAX_CLICKS) {
      alert('Hai raggiunto il limite di clic per oggi. Riprova domani.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const estimation = await fetchCollectibleEstimation(itemDetails)
      setFactors([
        { name: "Rarità", score: estimation.rarity, icon: <Star className="w-4 h-4" />, color: "#FFD700" },
        { name: "Domanda di Mercato", score: estimation.marketDemand, icon: <TrendingUp className="w-4 h-4" />, color: "#4CAF50" },
        { name: "Longevità", score: estimation.longevity, icon: <Clock className="w-4 h-4" />, color: "#FFA500" },
        { name: "Tendenze di Mercato", score: estimation.marketTrends, icon: <BarChart2 className="w-4 h-4" />, color: "#8E44AD" },
      ])
      updateClickData(clickCount + 1)
    } catch (error) {
      console.error('Errore durante il recupero della stima:', error)
      setError('Impossibile recuperare i dati di stima. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  const remainingClicks = MAX_CLICKS - clickCount

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Il Collezionista</CardTitle>
          <CardDescription>Scopri dettagli utili sul tuo articolo.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-600 flex justify-center items-center">Un collezionista AI sta stimando il tuo articolo...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : factors.length > 0 ? (
            <CollectorsIntuition factors={factors} onEstimateClick={handleEstimateClick} />
          ) : (
            <Button onClick={handleEstimateClick} className="w-full">Genera Stima</Button>
          )}
          <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
            <span>Clic rimanenti: {remainingClicks}</span>
            <InfoIcon remainingClicks={remainingClicks} resetTime={resetTime} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const InfoIcon: React.FC<{ remainingClicks: number; resetTime: string }> = ({ remainingClicks, resetTime }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const formattedResetTime = new Date(resetTime).toLocaleString()

  const toggleTooltip = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsTooltipVisible(!isTooltipVisible)
  }

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
  )
}

const CollectorsIntuition = ({ factors, onEstimateClick }: { factors: IntuitionFactor[], onEstimateClick: () => void }) => {
  const [infoVisible, setInfoVisible] = useState<{ [key: string]: boolean }>({})

  const handleInfoClick = (factorName: string) => {
    setInfoVisible((prev) => ({ ...prev, [factorName]: !prev[factorName] }))
  }

  const getInfoContent = (factorName: string) => {
    switch (factorName) {
      case "Rarità":
        return "La rarità indica quanto è comune o raro un oggetto. Valori più alti indicano maggiore rarità."
      case "Domanda di Mercato":
        return "La domanda di mercato rappresenta quanto è richiesto un oggetto attualmente. Valori più alti indicano maggiore domanda."
      case "Longevità":
        return "La longevità misura quanto un oggetto può mantenere il suo valore nel tempo. Valori più alti indicano maggiore longevità."
      case "Tendenze di Mercato":
        return "Le tendenze di mercato indicano come sta cambiando il valore di un oggetto nel tempo. Valori più alti indicano tendenze positive."
      default:
        return "Nessuna informazione disponibile."
    }
  }

  return (
    <Card className="w-full" onClick={onEstimateClick}>
      <CardContent className="p-0">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={factors}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis dataKey="name" type="category" hide />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {factors.map((entry, index) => (
                  <rect key={`bar-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  content={(props) => {
                    const { x, y, width, height, value, index } = props
                    return (
                      <g>
                        <foreignObject x={x ? Number(x) + 5 : 0} y={y ? Number(y) : 0} width={width ?? 20} height={height ?? 20}>
                          <div className="flex items-center h-full text-white">
                          {index !== undefined && React.cloneElement(factors[index].icon, { className: "w-4 h-4 mr-2" })}
                            <span className="text-sm">{value}</span>
                          </div>
                        </foreignObject>
                      </g>
                    )
                  }}
                />
                <LabelList
                  dataKey="score"
                  position="right"
                  offset={10}
                  formatter={(value) => `${value}/10`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 px-6 pb-6">
          {factors.map((factor, index) => (
            <div key={index} className="relative flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {React.cloneElement(factor.icon, { style: { color: factor.color } })}
                <span className={cn("text-sm text-gray-600")}>{factor.name}</span>
              </div>
              <div className="flex items-center gap-2 relative">
                <span className={cn("text-sm font-semibold")}>{factor.score}/10</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleInfoClick(factor.name)
                  }}
                  className="ml-2 p-1 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
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
        </div>
      </CardContent>
    </Card>
  )
}

const fetchCollectibleEstimation = async (articleDetails: ArticleDetails): Promise<EstimationResponse> => {
  const prompt = `Usa questi dettagli per stimare la rarità, la domanda di mercato, la longevità e le tendenze di mercato di un articolo:
Nome: ${articleDetails.name}
Categoria: ${articleDetails.category}
Anno: ${articleDetails.year}
Prezzo d'acquisto: ${articleDetails.purchasePrice}
Data d'acquisto: ${articleDetails.purchaseDate}
Valore attuale: ${articleDetails.currentValue}

Restituisci solo un oggetto JSON con i seguenti campi: rarity, marketDemand, longevity, marketTrends. Ogni campo deve essere un numero intero da 1 a 10, dove 1 è il valore più basso e 10 il più alto. Non includere altro testo.`

  console.log("Prompt inviato:", prompt)

  const url = 'https://api.groq.com/openai/v1/chat/completions'
  const headers = {
    Authorization: 'Bearer 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',
    'Content-Type': 'application/json',
  }
  const data = {
    model: 'llama-3.2-90b-text-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 100,
    top_p: 1,
    stream: false,
  }

  try {
    const response = await axios.post(url, data, { headers })
    const content = response.data.choices[0].message.content
    console.log('Risposta API:', content)
    return JSON.parse(content)
  } catch (error) {
    console.error('Error fetching estimation:', error)
    throw new Error('API request failed')
  }
}