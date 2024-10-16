'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, ThumbsUp, ThumbsDown, Zap, Bolt } from 'lucide-react'


interface IntuitionFactor {
  name: string
  score: number
  icon: React.ReactNode
}

export default function CollectorsIntuitionMeter({ itemId }: { itemId: string }) {
  const [intuitionScore, setIntuitionScore] = useState(0)
  const [factors, setFactors] = useState<IntuitionFactor[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const fetchIntuitionData = async () => {
    setIsAnalyzing(true)
    setShowDetails(false)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setFactors([
      { name: "Historical Significance", score: 85, icon: <Lightbulb className="w-4 h-4 text-white" /> },
      { name: "Market Trends", score: 70, icon: <ThumbsUp className="w-4 h-4 text-white" /> },
      { name: "Condition Assessment", score: 90, icon: <Zap className="w-4 h-4 text-white" /> },
      { name: "Provenance", score: 80, icon: <ThumbsDown className="w-4 h-4 text-white" /> },
    ])
    setIsAnalyzing(false)
    setShowDetails(true)
  }

  return (
    <div className="p-6 cursor-pointer" style={{ backgroundColor: 'transparent', height: 'auto' }} onClick={fetchIntuitionData}>
      <div className="relative h-48 mb-4">
        {/* Animation Section */}
        <div className="flex flex-row flex-shrink-0 justify-center items-center gap-4 relative">
          <Circle className="circle-1" icon={<Lightbulb className="w-4 h-4 text-white" />} delay={0.2} />
          <Circle className="circle-2" icon={<ThumbsUp className="w-3 h-3 text-white" />} delay={0.4} />
          <Circle className="circle-3" icon={<Bolt className="w-12 h-12 text-white" />} delay={0.6} center />
          <Circle className="circle-4" icon={<ThumbsDown className="w-3 h-3 text-white" />} delay={0.8} />
          <Circle className="circle-5" icon={<Zap className="w-2 h-2 text-white" />} delay={1.0} />

          {/* Center animated line */}
          <motion.div
            className="h-40 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent absolute"
            style={{ left: 0 }}
            animate={{ x: [0, 250, 0] }} // moves to last icon (adjusted x value for correct end position)
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 4, // Added a 4-second delay before the animation restarts
              ease: "linear",
            }}
          >
            <motion.div
              className="w-10 h-32 top-1/2 -translate-y-1/2 absolute left-1/2 transform -translate-x-1/2" // Ensure sparkles are centered
              animate={{ y: [0, -40, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const Circle = ({ className, icon, center = false, delay }: { className: string, icon: React.ReactNode, center?: boolean, delay: number }) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: -20 }}
      transition={{
        repeat: Infinity,
        repeatDelay: 4, // Added the 4-second delay after icon moves down
        delay: delay,
        duration: 1.6,     // Made the duration longer for smoother movement
        ease: "easeInOut",  // Smoother easing function for all movements
        yoyo: true
      }}
      className={`flex items-center justify-center rounded-full ${center ? 'h-16 w-16' : 'h-8 w-8'} bg-black ${className} shadow-inner`} // Updated to black background with inner shadow
      style={{ boxShadow: 'inset 0px 4px 8px rgba(0, 0, 0, 0.3)' }} // Inner shadow style
    >
      {icon}
    </motion.div>
  );
};

// Sparkles effect
const Sparkles = () => {
  const randomMove = () => Math.random() * 2 - 1;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();
  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 2 + 4,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
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