'use client';
import { useState, useEffect } from 'react';
import { getEntryByDate } from './action/actions'; // Adjust path as needed
import { Trophy, Target, Book, Brain, Clock, Zap, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import ScoreDisplay from './component/home/scoreDisplay';
import MetricCard from './component/home/metricCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// MetricCard component



export default function Home() {
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const getWinner = (data) => {
    if (!data.sujal && !data.pankaj) return 'No data';
    if (!data.sujal) return 'Pankaj';
    if (!data.pankaj) return 'Sujal';
    if (data.sujal.overallScore > data.pankaj.overallScore) return 'Sujal';
    if (data.pankaj.overallScore > data.sujal.overallScore) return 'Pankaj';
    return 'Tie';
  };

  const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError('');
      try {
        const entries = await getEntryByDate({ date: selectedDate });
        setData(entries);
        setLoading(false);
      } catch (error) {
        console.error(error.message);
        setError(error.message);
        setData({});
        setLoading(false);
      }
    };
    fetchEntries();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Performance Dashboard</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const winner = getWinner(data);

  const metrics = [
    { icon: Target, label: 'Exercise', sujalValue: data.sujal?.exercise, pankajValue: data.pankaj?.exercise, type: 'boolean' },
    { icon: Brain, label: 'Meditation', sujalValue: (data.sujal?.meditationMinutes || 0), pankajValue: (data.pankaj?.meditationMinutes || 0), type: 'min' },
    { icon: Zap, label: 'Kutumbiq', sujalValue: data.sujal?.hoursKutumbiq, pankajValue: data.pankaj?.hoursKutumbiq, type: 'time' },
    { icon: Book, label: 'Reading', sujalValue: data.sujal?.hoursReading, pankajValue: data.pankaj?.hoursReading, type: 'time' },
    { icon: Brain, label: 'Learning', sujalValue: data.sujal?.hoursImprovingLearning, pankajValue: data.pankaj?.hoursImprovingLearning, type: 'time' },
    { icon: Clock, label: 'Timepass', sujalValue: data.sujal?.hoursTimepass, pankajValue: data.pankaj?.hoursTimepass, type: 'time' },
    { icon: AlertTriangle, label: 'Wasted', sujalValue: data.sujal?.hoursWasted, pankajValue: data.pankaj?.hoursWasted, type: 'time' },
  ];

  const hoursBreakdownChartData = {
    labels: ['Kutumbiq', 'Reading', 'Improving', 'Timepass', 'Wasted', 'Meditation'],
    datasets: [
      {
        label: 'Sujal',
        data: [
          data.sujal?.hoursKutumbiq || 0,
          data.sujal?.hoursReading || 0,
          data.sujal?.hoursImprovingLearning || 0,
          data.sujal?.hoursTimepass || 0,
          data.sujal?.hoursWasted || 0,
          (data.sujal?.meditationMinutes || 0) / 60, // Convert minutes to hours
        ],
        backgroundColor: 'rgba(225, 29, 72, 0.8)', // Red for Sujal
        borderColor: 'rgba(225, 29, 72, 0.8)',
        borderWidth: 2,
      },
      {
        label: 'Pankaj',
        data: [
          data.pankaj?.hoursKutumbiq || 0,
          data.pankaj?.hoursReading || 0,
          data.pankaj?.hoursImprovingLearning || 0,
          data.pankaj?.hoursTimepass || 0,
          data.pankaj?.hoursWasted || 0,
          (data.pankaj?.meditationMinutes || 0) / 60, // Convert minutes to hours
        ],
        backgroundColor: 'rgba(37, 99, 235, 0.8)', // Blue for Pankaj
        borderColor: 'rgba(37, 99, 235)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { display: true },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Dashboard</h1>
            <p className="text-slate-600">Track daily competition metrics</p>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <Calendar className="w-5 h-5 text-slate-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none focus:outline-none text-slate-700 bg-transparent"
            />
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 h-fit px-6 mt-8 border-t py-8 border-neutral-200">
          {/* Winner Announcement */}
          <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Today's Winner</h2>
                  <p className="text-slate-300">Daily champion</p>
                </div>
              </div>
              <div className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {winner}
              </div>
              <div className="flex items-center gap-6">
                <ScoreDisplay
                  name="Sujal"
                  score={data.sujal?.overallScore}
                  isWinner={winner === 'Sujal'}
                  color="text-rose-500"
                  bgColor="bg-rose-600"
                />
                <div className="text-slate-500">vs</div>
                <ScoreDisplay
                  name="Pankaj"
                  score={data.pankaj?.overallScore}
                  isWinner={winner === 'Pankaj'}
                  color="text-blue-500"
                  bgColor="bg-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <TrendingUp className="w-8 h-8 mb-4 text-emerald-100" />
              <h3 className="text-lg font-semibold mb-6">Key Insights</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-emerald-100">Total Productive Hours</p>
                  <p className="text-2xl font-bold">
                    {((data.sujal?.hoursKutumbiq || 0) + (data.sujal?.hoursReading || 0) + (data.sujal?.hoursImprovingLearning || 0)).toFixed(1)}h vs {((data.pankaj?.hoursKutumbiq || 0) + (data.pankaj?.hoursReading || 0) + (data.pankaj?.hoursImprovingLearning || 0)).toFixed(1)}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Exercise Status</p>
                  <p className="text-lg font-semibold">
                    {data.sujal?.exercise ? '✓' : '✗'} Sujal | {data.pankaj?.exercise ? '✓' : '✗'} Pankaj
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Breakdown (Bar Graph) */}
          <div className="col-span-12 lg:col-span-12 bg-white/40 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Hours Breakdown</h3>
            <Bar data={hoursBreakdownChartData} options={chartOptions} />
          </div>


          {/* Metrics Grid */}
          <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <MetricCard
                key={index}
                icon={metric.icon}
                label={metric.label}
                sujalValue={metric.sujalValue}
                pankajValue={metric.pankajValue}
                type={metric.type}
                className={index === 0 ? "lg:col-span-2" : ""}
              />
            ))}
          </div>

          {/* Sujal vs. Pankaj Tasks and Learnings */}
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sujal Card */}
            <div className={`p-6 bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl ${winner === 'Sujal' ? 'border-l-4 border-rose-500' : ''}`}>
              <h3 className="text-lg font-semibold mb-4 text-rose-500">Sujal</h3>
              {data.sujal ? (
                <>
                  <p className="font-medium mb-2"><strong>Assigned Tasks:</strong></p>
                  <ul className="list-disc pl-5 mb-4">
                    {data.sujal.assignedTasks.map((task, index) => (
                      <li key={index} className="text-sm">{task.task}: {task.score}/10</li>
                    ))}
                  </ul>
                  <p className="font-medium mb-2"><strong>Major Tasks:</strong></p>
                  <ul className="list-disc pl-5 mb-4">
                    {data.sujal.majorTasks.map((task, index) => (
                      <li key={index} className="text-sm">{task.task}: {task.completed ? 'Completed' : 'Not Completed'}</li>
                    ))}
                  </ul>
                  <p className="font-medium mb-2"><strong>Overall Learnings:</strong></p>
                  <div className="whitespace-pre-line text-sm text-slate-700">{data.sujal.overallLearnings}</div>
                </>
              ) : (
                <p className="text-sm text-slate-600">No entry for Sujal on this date</p>
              )}
            </div>

            {/* Pankaj Card */}
            <div className={`p-6 bg-white/40 backdrop-blur-sm border border-white/20 rounded-2xl ${winner === 'Pankaj' ? 'border-l-4 border-blue-500' : ''}`}>
              <h3 className="text-lg font-semibold mb-4 text-blue-500">Pankaj</h3>
              {data.pankaj ? (
                <>
                  <p className="font-medium mb-2"><strong>Assigned Tasks:</strong></p>
                  <ul className="list-disc pl-5 mb-4">
                    {data.pankaj.assignedTasks.map((task, index) => (
                      <li key={index} className="text-sm">{task.task}: {task.score}/10</li>
                    ))}
                  </ul>
                  <p className="font-medium mb-2"><strong>Major Tasks:</strong></p>
                  <ul className="list-disc pl-5 mb-4">
                    {data.pankaj.majorTasks.map((task, index) => (
                      <li key={index} className="text-sm">{task.task}: {task.completed ? 'Completed' : 'Not Completed'}</li>
                    ))}
                  </ul>
                  <p className="font-medium mb-2"><strong>Overall Learnings:</strong></p>
                  <div className="whitespace-pre-line text-sm text-slate-700">{data.pankaj.overallLearnings}</div>
                </>
              ) : (
                <p className="text-sm text-slate-600">No entry for Pankaj on this date</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}