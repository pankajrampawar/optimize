'use client'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';

const Stopwatch = ({ selectedTimerType, onReset }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(0);
    const [lastAlertTime, setLastAlertTime] = useState(0);
    const intervalRef = useRef(null);
    const soundRef = useRef(null);

    // Initialize sound
    useEffect(() => {
        soundRef.current = new Howl({
            src: ['/notification.wav'],
            format: ['wav'], // Explicitly specify format
            html5: true, // Force HTML5 Audio (better for some WAV files)
            loop: true,
            volume: 0.5,
            onload: () => console.log('Sound loaded successfully'),
            onloaderror: (id, err) => {
                console.error('Load error:', err);
                // Fallback to MP3 if WAV fails
                soundRef.current = new Howl({
                    src: ['/notification.mp3'],
                    loop: true,
                    volume: 0.5
                });
            }
        });

        return () => {
            soundRef.current?.unload();
        };
    }, []);

    // Check for 20 minute intervals (1200 seconds)
    useEffect(() => {
        if (isRunning && time > 0 && time >= lastAlertTime + 1200) {
            handleTwentyMinuteAlert();
            setLastAlertTime(time);
        }
    }, [time, isRunning]);

    const handleTwentyMinuteAlert = () => {
        setShowAlert(true);
        setIsRunning(false);
        soundRef.current?.play();
    };

    const handleProductive = () => {
        setShowAlert(false);
        soundRef.current?.stop();
        setIsRunning(true);
    };

    const handleUnproductive = () => {
        setShowAlert(false);
        soundRef.current?.stop();
        const newTime = Math.max(0, time - 1200); // Subtract 20 minutes (1200 seconds)
        setTime(newTime);
        saveTimeToLocalStorage(newTime);
        setLastAlertTime(newTime); // Reset the alert time
        setIsRunning(true);
    };

    const startStopwatch = () => {
        setIsRunning(true);
        // Initialize lastAlertTime when starting
        if (time === 0) {
            setLastAlertTime(0);
        }
    };

    const stopStopwatch = () => {
        setIsRunning(false);
        saveTimeToLocalStorage(time);
    };

    const resetStopwatch = () => {
        saveTimeToLocalStorage(time);
        setTime(0);
        setIsRunning(false);
        setLastAlertTime(0);
        onReset();
    };

    const saveTimeToLocalStorage = (currentTime) => {
        const today = new Date().toISOString().split('T')[0];
        const existingData = JSON.parse(localStorage.getItem('productivityData')) || {};

        const timerKey = `${selectedTimerType}_stopwatch`;
        const existingEntry = existingData[timerKey];

        if (existingEntry && existingEntry.date === today) {
            existingData[timerKey] = {
                ...existingEntry,
                time: existingEntry.time + (currentTime - lastSavedTime)
            };
        } else {
            existingData[timerKey] = {
                time: currentTime - lastSavedTime,
                date: today,
                type: selectedTimerType,
                mode: 'stopwatch'
            };
        }

        localStorage.setItem('productivityData', JSON.stringify(existingData));
        setLastSavedTime(currentTime);
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative">
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-md opacity-30"></div>
                    <div className="relative bg-gray-800 rounded-full p-4 w-48 h-48 flex items-center justify-center border border-gray-700">
                        <span className="text-4xl font-mono">{formatTime(time)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                {!isRunning && time === 0 ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startStopwatch}
                        className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full font-medium"
                    >
                        Start
                    </motion.button>
                ) : isRunning ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopStopwatch}
                        className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-full font-medium"
                    >
                        Stop
                    </motion.button>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startStopwatch}
                            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-medium"
                        >
                            Resume
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetStopwatch}
                            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full font-medium"
                        >
                            Reset
                        </motion.button>
                    </>
                )}
            </div>

            {/* 20 Minute Alert */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 bg-gray-800 rounded-xl p-6 mt-4 border border-gray-700 z-10"
                    >
                        <h3 className="text-xl font-bold mb-4">20 Minute Checkpoint</h3>
                        <p className="text-gray-300 mb-4">Were these 20 minutes productive?</p>
                        <div className="flex space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleProductive}
                                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-medium flex-1"
                            >
                                Productive
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUnproductive}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-medium flex-1"
                            >
                                Not Productive
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Stopwatch;