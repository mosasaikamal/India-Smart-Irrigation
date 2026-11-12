import React from 'react';
import { ItemReport } from '../../types/campusfind';
import { useCampusFind } from '../../context/CampusFindContext';
import { 
  MapPin, 
  Calendar, 
  ArrowRight,
  Package,
  IdCard,
  Smartphone,
  CupSoda,
  BookOpen,
  Briefcase,
  Key
} from 'lucide-react';

interface ItemCardProps {
  item: ItemReport;
  showMatchIndicator?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { navigateTo } = useCampusFind();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'id_cards':
        return <IdCard className="w-5 h-5 text-blue-600" />;
      case 'electronics':
        return <Smartphone className="w-5 h-5 text-indigo-600" />;
      case 'bottles':
        return <CupSoda className="w-5 h-5 text-cyan-600" />;
      case 'books_stationery':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'bags':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'keys':
        return <Key className="w-5 h-5 text-emerald-600" />;
      default:
        return <Package className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = () => {
    if (item.status === 'returned') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Returned
        </span>
      );
    }
    if (item.type === 'lost') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Lost
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        Found
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-4 sm:p-5 space-y-3">
        {/* Placeholder Icon Header & Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            {getCategoryIcon(item.category)}
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Item Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
          {item.title}
        </h3>

        {/* Location & Date */}
        <div className="space-y-1.5 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={item.location}>{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{item.date}</span>
          </div>
        </div>
      </div>

      {/* View Details Action */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100">
        <button
          onClick={() => navigateTo('item-detail', item.id)}
          className="w-full py-2 px-3 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
