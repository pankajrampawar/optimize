export async function submitDailyEntry(formData, user, day) {
    try {
        const response = await fetch('/api/dailyEntry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, user, day }),
        });
        if (response.ok) {
            return { success: true, data: await response.json() };
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save entry');
        }
    } catch (error) {
        console.error('Error submitting daily entry:', error);
        return { success: false, error: error.message };
    }
}