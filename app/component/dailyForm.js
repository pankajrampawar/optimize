'use client';
import { useState } from 'react';
import { useUser } from '@/context/userContext';
import { submitDailyEntry } from '../action/dailyEntry';

export default function DailyForm() {
    const { user } = useUser();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        meditationMinutes: 0,
        exercise: false,
        assignedTasks: [
            { task: '', score: 1 },
            { task: '', score: 1 },
            { task: '', score: 1 },
        ],
        hoursKutumbiq: 0,
        hoursReading: 0,
        hoursTimepass: 0,
        hoursImprovingLearning: 0,
        majorTasks: [
            { task: '', completed: false },
            { task: '', completed: false },
            { task: '', completed: false },
        ],
        hoursWasted: 0,
        overallLearnings: '',
    });

    const handleChange = (e, index, field, subfield) => {
        const { name, value, type, checked } = e.target;
        if (field) {
            setFormData((prev) => {
                const updatedArray = [...prev[field]];
                updatedArray[index] = {
                    ...updatedArray[index],
                    [subfield]: type === 'checkbox' ? checked : value
                };
                return { ...prev, [field]: updatedArray };
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            meditationMinutes: 0,
            exercise: false,
            assignedTasks: [
                { task: '', score: 1 },
                { task: '', score: 1 },
                { task: '', score: 1 },
            ],
            hoursKutumbiq: 0,
            hoursReading: 0,
            hoursTimepass: 0,
            hoursImprovingLearning: 0,
            majorTasks: [
                { task: '', completed: false },
                { task: '', completed: false },
                { task: '', completed: false },
            ],
            hoursWasted: 0,
            overallLearnings: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await submitDailyEntry(formData, user, day)

            if (response.ok) {
                alert('Entry saved successfully!');
                resetForm();
            } else {
                alert('Failed to save entry.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateForDisplay = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-fit bg-gray-50 py-8 my-10 rounded-2xl">
            <div className="min-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* User & Date Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current User
                                </label>
                                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                                    {user || 'Please select a user'}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatDateForDisplay(selectedDate)}
                                </p>
                            </div>
                        </div>

                        {/* Wellness Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Wellness & Habits
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meditation (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="meditationMinutes"
                                        value={formData.meditationMinutes}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex items-center pt-8">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="exercise"
                                            checked={formData.exercise}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">
                                            Completed Exercise Today
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Time Allocation Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Time Allocation (Hours)
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kutumbiq Work
                                    </label>
                                    <input
                                        type="number"
                                        name="hoursKutumbiq"
                                        value={formData.hoursKutumbiq}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reading
                                    </label>
                                    <input
                                        type="number"
                                        name="hoursReading"
                                        value={formData.hoursReading}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Learning & Improvement
                                    </label>
                                    <input
                                        type="number"
                                        name="hoursImprovingLearning"
                                        value={formData.hoursImprovingLearning}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conscious Timepass
                                    </label>
                                    <input
                                        type="number"
                                        name="hoursTimepass"
                                        value={formData.hoursTimepass}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hours Wasted
                                    </label>
                                    <input
                                        type="number"
                                        name="hoursWasted"
                                        value={formData.hoursWasted}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.5"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Daily Tasks
                            </h2>

                            {/* Assigned Tasks */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Assigned Tasks</h3>
                                <div className="space-y-4">
                                    {formData.assignedTasks.map((task, index) => (
                                        <div key={index} className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Task {index + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Describe your assigned task"
                                                    value={task.task}
                                                    onChange={(e) => handleChange(e, index, 'assignedTasks', 'task')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Score
                                                </label>
                                                <select
                                                    value={task.score}
                                                    onChange={(e) => handleChange(e, index, 'assignedTasks', 'score')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {i + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Major Tasks */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Major Tasks</h3>
                                <div className="space-y-4">
                                    {formData.majorTasks.map((task, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder={`Major Task ${index + 1}`}
                                                    value={task.task}
                                                    onChange={(e) => handleChange(e, index, 'majorTasks', 'task')}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <label className="flex items-center cursor-pointer whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={(e) => handleChange(e, index, 'majorTasks', 'completed')}
                                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">
                                                    Completed
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reflections Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Daily Reflections
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Overall Learnings & Insights
                                </label>
                                <textarea
                                    name="overallLearnings"
                                    value={formData.overallLearnings}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                                    rows="6"
                                    placeholder="Reflect on your day... What did you learn? What went well? What could be improved?"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isSubmitting || !user}
                                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Entry'}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                            >
                                Reset Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}