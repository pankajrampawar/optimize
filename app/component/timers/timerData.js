'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimerDataPopup = ({ onClose }) => {
    const [data, setData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('productivityData')) || {};
        } catch {
            return {};
        }
    });

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hrs}h ${mins}m`;
    };

    const clearData = () => {
        localStorage.removeItem('productivityData');
        setData({});
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700 shadow-xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        Your Productivity Data
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {Object.keys(data).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No timer data available yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(data).map(([key, entry]) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-700 rounded-xl p-4 border border-gray-600"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg capitalize">{entry.type.replace('_', ' ')}</h3>
                                        <p className="text-gray-400 text-sm">{entry.date} • {entry.mode}</p>
                                    </div>
                                    <span className="text-xl font-mono bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                                        {formatTime(entry.time)}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                        style={{ width: `${Math.min(100, entry.time / 3600)}%` }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={clearData}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium"
                    >
                        Clear All Data
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                    >
                        Close
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};
