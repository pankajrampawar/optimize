import { Trophy } from 'lucide-react';

export default function ScoreDisplay({ name, score, isWinner, color, bgColor }) {
    return (
        <div className={`${bgColor} rounded-3xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold opacity-90">{name}</h3>
                    {isWinner && (
                        <div className="bg-white/20 p-2 rounded-xl ml-2">
                            <Trophy className="w-5 h-5 text-amber-300" />
                        </div>
                    )}
                </div>
                <div className="text-4xl font-bold mb-2">{score || '-'}</div>
                <div className="text-sm opacity-75">Overall Score</div>
            </div>
        </div>
    )
};