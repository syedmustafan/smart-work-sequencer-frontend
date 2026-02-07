import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn, getCurrentWeekRange, getLastWeekRange } from '../lib/utils';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
  className?: string;
}

const presets = [
  { label: 'This Week', getRange: getCurrentWeekRange },
  { label: 'Last Week', getRange: getLastWeekRange },
  { label: 'Last 7 Days', getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start, end };
  }},
  { label: 'Last 14 Days', getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 13);
    return { start, end };
  }},
  { label: 'Last 30 Days', getRange: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start, end };
  }},
];

export default function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (getRange: () => { start: Date; end: Date }) => {
    const { start, end } = getRange();
    onRangeChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl hover:border-dark-500 transition-colors"
      >
        <Calendar className="w-4 h-4 text-primary-400" />
        <span className="text-dark-100">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-dark-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-20 overflow-hidden animate-slide-down">
            <div className="p-2 border-b border-dark-700">
              <p className="text-xs font-medium text-dark-400 px-2 py-1">Quick Select</p>
            </div>
            <div className="p-2 space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.getRange)}
                  className="w-full text-left px-3 py-2 text-sm text-dark-200 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-dark-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">Start</label>
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => onRangeChange(new Date(e.target.value), endDate)}
                    className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-dark-400 mb-1 block">End</label>
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => onRangeChange(startDate, new Date(e.target.value))}
                    className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
