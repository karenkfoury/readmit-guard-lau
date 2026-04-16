interface ScheduleDayRailProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  countByDate: Record<string, number>;
}

export function ScheduleDayRail({ dates, selectedDate, onSelectDate, countByDate }: ScheduleDayRailProps) {
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (dateStr === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="w-full lg:w-80 space-y-1">
      {dates.map((date) => {
        const count = countByDate[date] || 0;
        const isSelected = date === selectedDate;
        const isToday = date === today;
        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-lau-border hover:border-primary/40'
            }`}
          >
            <div>
              <p className={`text-sm font-heading font-semibold ${isSelected ? '' : 'text-lau-anthracite'}`}>
                {formatDate(date)}
              </p>
              <p className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'} font-body`}>
                {formatFullDate(date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isToday && !isSelected && (
                <span className="text-[10px] bg-risk-high-bg text-risk-high px-2 py-0.5 rounded-full font-semibold">
                  TODAY
                </span>
              )}
              {count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-lau-green-tint text-primary'
                  }`}
                >
                  {count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
