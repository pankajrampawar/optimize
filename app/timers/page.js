'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stopwatch from '../component/timers/stopwatch';
import { TimerDataPopup } from '../component/timers/timerData';

export default function Timers() {
    const [selectedTimerType, setSelectedTimerType] = useState(null);
    const [selectedMode, setSelectedMode] = useState(null);
    const [showDataPopup, setShowDataPopup] = useState(false);

    const timerTypes = [
        { id: 'timepass', label: 'Timepass', emoji: '⏳', color: 'bg-purple-500' },
        { id: 'reading', label: 'Reading', emoji: '📚', color: 'bg-blue-500' },
        { id: 'learning', label: 'Learning/Improving', emoji: '🧠', color: 'bg-green-500' },
        { id: 'kutumbiq', label: 'Kutumbiq', emoji: '👨‍👩‍👧‍👦', color: 'bg-amber-500' },
    ];

    const handleTimerTypeSelect = (type) => {
        setSelectedTimerType(type);
    };

    const handleModeSelect = (mode) => {
        setSelectedMode(mode);
        // Here you would start the actual timer
    };

    const resetSelection = () => {
        setSelectedTimerType(null);
        setSelectedMode(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {!selectedTimerType ? (
                    <motion.div
                        key="timer-type-selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                            What are you focusing on?
                        </h1>
                        <p className="text-gray-400 mb-8 text-center">Select your activity to begin</p>

                        <div className="grid grid-cols-2 gap-4">
                            {timerTypes.map((timer) => (
                                <motion.button
                                    key={timer.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTimerTypeSelect(timer.id)}
                                    className={`${timer.color} rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-lg hover:shadow-xl transition-all`}
                                >
                                    <span className="text-4xl mb-2">{timer.emoji}</span>
                                    <span className="text-xl font-medium">{timer.label}</span>
                                </motion.button>
                            ))}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDataPopup(true)}
                                className="bg-gray-700 hover:bg-gray-600 rounded-2xl px-6 py-2 flex flex-col items-center justify-center  shadow-lg hover:shadow-xl transition-all col-span-2"
                            >
                                <span className="text-4xl mb-2">📊</span>
                                <span className="text-xl font-medium">Timer Data</span>
                            </motion.button>
                        </div>
                    </motion.div>
                ) : !selectedMode ? (
                    <motion.div
                        key="mode-selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <button
                            onClick={resetSelection}
                            className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>

                        <h2 className="text-3xl font-bold mb-2 text-center">
                            {timerTypes.find(t => t.id === selectedTimerType)?.emoji}{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                {timerTypes.find(t => t.id === selectedTimerType)?.label}
                            </span>
                        </h2>
                        <p className="text-gray-400 mb-8 text-center">Choose your timer mode</p>

                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModeSelect('stopwatch')}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-left flex items-center justify-between shadow-lg"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">Stopwatch</h3>
                                    <p className="text-gray-200">Flexible timing </p>
                                    <p className='text-xs text-gray-200'>needs you to confirm your activity every 20 mins</p>
                                </div>
                                <div className="text-3xl">⏱️</div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModeSelect('pomodoro')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-left flex items-center justify-between shadow-lg"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">Pomodoro</h3>
                                    <p className="text-gray-200">25 min work + 5 min break</p>
                                </div>
                                <div className="text-3xl">🍅</div>
                            </motion.button>
                        </div>
                    </motion.div>
                ) : selectedMode === 'stopwatch' ? (
                    <motion.div
                        key="timer-screen"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                    >
                        <button
                            onClick={resetSelection}
                            className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Change activity
                        </button>

                        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
                            <h2 className="text-2xl font-bold mb-1 text-center">
                                {timerTypes.find(t => t.id === selectedTimerType)?.emoji}{' '}
                                {timerTypes.find(t => t.id === selectedTimerType)?.label}
                            </h2>
                            <p className="text-gray-400 mb-8 text-center">Stopwatch</p>

                            <Stopwatch
                                selectedTimerType={selectedTimerType}
                                onReset={resetSelection}
                            />
                        </div>
                    </motion.div>
                ) : "something"
                }

            </AnimatePresence>

            <AnimatePresence>
                {showDataPopup && <TimerDataPopup onClose={() => setShowDataPopup(false)} />}
            </AnimatePresence>
        </div>
    );
}   