const StatusCard = ({ title, value, icon: Icon, status, colorClass, isDark }) => {
    const borderColors = {
      red: 'border-l-red-500',
      blue: 'border-l-blue-500', 
      yellow: 'border-l-amber-500',
      green: 'border-l-emerald-500',
      gray: 'border-l-gray-500'
    };
    
    const getBadgeStyles = (status, isDark) => {
      const baseClasses = 'inline-block px-2 py-1 text-xs rounded-full mt-2 border';
      
      // Manual dark mode handling
      if (isDark) {
        switch(status) {
          case 'ON': case 'ACTIVE': case 'INFO': case 'SYSTEM':
            return `${baseClasses} bg-emerald-900 text-emerald-200 border-emerald-500/60`;
          case 'OFF': case 'STANDBY': case 'MANUAL': case 'CLEAR': case 'SAFE':
            return `${baseClasses} bg-slate-700 text-slate-200 border-gray-500/60`;
          case 'DETECTED': case 'DANGER':
            return `${baseClasses} bg-rose-900 text-rose-200 border-rose-500/60`;
          case 'LOW': case 'NORMAL': case 'MOTION': case 'RAIN': case 'ENABLED':
            return `${baseClasses} bg-blue-900 text-blue-200 border-blue-500/60`;
          default:
            return `${baseClasses} bg-slate-700 text-slate-200 border-gray-500/60`;
        }
      } else {
        // Light mode
        switch(status) {
          case 'ON': case 'ACTIVE': case 'INFO': case 'SYSTEM':
            return `${baseClasses} bg-emerald-100 text-emerald-700 border-emerald-500/60`;
          case 'OFF': case 'STANDBY': case 'MANUAL': case 'CLEAR': case 'SAFE':
            return `${baseClasses} bg-gray-100 text-gray-700 border-gray-500/60`;
          case 'DETECTED': case 'DANGER':
            return `${baseClasses} bg-rose-100 text-rose-800 border-rose-500/60`;
          case 'LOW': case 'NORMAL': case 'MOTION': case 'RAIN': case 'ENABLED':
            return `${baseClasses} bg-blue-100 text-blue-800 border-blue-500/60`;
          default:
            return `${baseClasses} bg-gray-100 text-gray-700 border-gray-500/60`;
        }
      }
    };

    // Manual conditional classes
    const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
    const titleColor = isDark ? 'text-slate-300' : 'text-gray-500';
    const valueColor = isDark ? 'text-slate-50' : 'text-slate-900';

    return (
      <div className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 ${borderColors[colorClass]} transition-transform hover:scale-105`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-sm font-medium uppercase tracking-wide ${titleColor}`}>{title}</h3>
            <p className={`text-2xl font-bold ${valueColor} mt-2`}>{value}</p>
            {status && (
              <span className={getBadgeStyles(status, isDark)}>
                {status}
              </span>
            )}
          </div>
          <Icon className={`icon-${colorClass}`} size={32} />
        </div>
      </div>
    );
  };

export default StatusCard;