export default function MetricCard({ icon: Icon, label, sujalValue, pankajValue, type = 'number', className = '' }) {
    const isTimeType = type === 'time';
    const isMinType = type === 'min'
    const isBooleanType = type === 'boolean';

    const getDisplayValue = (value) => {
        if (value === undefined || value === null) return '-';
        if (isBooleanType) return value ? 'Yes' : 'No';
        if (isTimeType) return `${value} hrs`;
        if (isMinType) return `${value} mins`;
        return value;
    };

    const getLeader = () => {
        if (sujalValue === undefined || pankajValue === undefined) return 'tie';
        if (isBooleanType) {
            if (sujalValue === pankajValue) return 'tie';
            return sujalValue ? 'sujal' : 'pankaj';
        }
        if (sujalValue === pankajValue) return 'tie';
        if (label.toLowerCase().includes('wasted') || label.toLowerCase().includes('timepass')) {
            return sujalValue < pankajValue ? 'sujal' : 'pankaj';
        }
        return sujalValue > pankajValue ? 'sujal' : 'pankaj';
    };

    const leader = getLeader();

    return (
        <div className={`group bg-white/50 backdrop-blur-sm border border-white/20 shadow-md rounded-2xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 ${className} h-fit`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                    <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-medium text-slate-800 text-sm">{label}</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-600">Sujal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${leader === 'sujal' ? 'text-rose-600' : 'text-slate-700'}`}>
                            {getDisplayValue(sujalValue)}
                        </span>
                        {leader === 'sujal' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-600">Pankaj</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${leader === 'pankaj' ? 'text-blue-600' : 'text-slate-700'}`}>
                            {getDisplayValue(pankajValue)}
                        </span>
                        {leader === 'pankaj' && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};