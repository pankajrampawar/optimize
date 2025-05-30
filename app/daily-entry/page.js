import DailyForm from "../component/dailyForm"

export default function DailyEntry() {
    return (
        <div>
            <div className="px-8 py-6 border-b border-gray-100">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Daily Tracking</h1>
                <p className="text-gray-600">Record your daily progress and reflections</p>
            </div>
            <div className="px-16 w-full">
                <DailyForm />
            </div>
        </div>
    )
}