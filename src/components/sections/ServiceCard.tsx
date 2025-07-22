import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';

type Service = {
  title: string;
  image: string;
  Icon: React.ElementType;
  description: string;
  expandContent: { name: string; link: string; }[] | null;
};

interface ServiceCardProps {
  service: Service;
  index: number;
}

export const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-400 flex flex-col overflow-hidden"
      layout={false} // Prevent layout animations that cause background shifts
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 shrink-0">
            <service.Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {service.title}
          </h3>
        </div>
        <p className="text-white/80 mt-4 text-base leading-relaxed flex-grow">{service.description}</p>

        {service.expandContent && (
          <div className="mt-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-white font-semibold hover:text-white/80 transition-colors text-left py-2 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg"
              aria-expanded={isExpanded}
              aria-controls={`expand-content-${index}`}
            >
              <span>{t('services.airport.viewOptions')}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
            
            {/* Use a fixed container to prevent layout shifts */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    id={`expand-content-${index}`}
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: "auto", 
                      marginTop: 12,
                      transition: {
                        height: { duration: 0.3, ease: "easeOut" },
                        opacity: { duration: 0.2, delay: 0.1 },
                        marginTop: { duration: 0.3, ease: "easeOut" }
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      height: 0, 
                      marginTop: 0,
                      transition: {
                        opacity: { duration: 0.15 },
                        height: { duration: 0.25, delay: 0.05, ease: "easeIn" },
                        marginTop: { duration: 0.25, delay: 0.05, ease: "easeIn" }
                      }
                    }}
                    className="space-y-2"
                  >
                    {service.expandContent.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: i * 0.05 + 0.1 }
                        }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <Link
                          href={item.link}
                          className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 group/link transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/90 group-hover/link:text-white transition-colors">
                              {item.name}
                            </span>
                            <ArrowRight className="w-5 h-5 text-white/60 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:text-white transition-all duration-300" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};