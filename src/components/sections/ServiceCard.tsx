import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
              className="flex items-center justify-between w-full text-white font-semibold hover:text-white/80 transition-colors text-left py-2"
            >
              <span>{t('services.airport.viewOptions')}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {service.expandContent.map((item, i) => (
                  <Link
                    key={i}
                    href={item.link}
                    className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 group/link"
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};