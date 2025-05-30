export async function getEntryByDate({ date }) {
    try {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }

        // Make GET request to the API route
        const response = await fetch(`/api/dailyEntry/${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Parse response
        const { data, error } = await response.json();

        if (!response.ok) {
            throw new Error(error || 'Failed to fetch entries');
        }

        // Return the entries for both users
        return {
            sujal: data.sujal || null,
            pankaj: data.pankaj || null,
        };
    } catch (error) {
        console.error('Error fetching entries:', error.message);
        throw new Error(error.message || 'An error occurred while fetching entries');
    }
}


export const getWinner = (data) => {
    if (!data.sujal && !data.pankaj) return 'No data';
    if (!data.sujal) return 'Pankaj';
    if (!data.pankaj) return 'Sujal';
    if (data.sujal.overallScore > data.pankaj.overallScore) return 'Sujal';
    if (data.pankaj.overallScore > data.sujal.overallScore) return 'Pankaj';
    return 'Tie';
};
