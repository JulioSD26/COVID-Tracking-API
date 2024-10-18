let covidChartInstance = null; // variable global para chart

const fetchCovidData = async (state) => {
    const apiUrl = `https://api.covidtracking.com/v1/states/${state}/daily.json`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        alert('Could not fetch data. Please try again later.');
    }
};

const drawChart = (dates, cases) => {
    const ctx = document.getElementById('covidChart').getContext('2d');
    const chartType = document.querySelector('input[name="chartType"]:checked').value;

    // eliminar el chart si existe uno
    if (covidChartInstance) {
        covidChartInstance.destroy();
    }

    // crear un nuevo chart
    covidChartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: dates,
            datasets: [{
                label: 'Confirmed Cases',
                data: cases,
                borderColor: '#7d5dab',
                backgroundColor: 'rgba(125, 93, 171, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

document.getElementById('fetch-data').addEventListener('click', async () => {
    const state = document.getElementById('state-select').value;
    const covidStatsDiv = document.getElementById('covid-stats');

    if (!state) {
        covidStatsDiv.innerHTML = '<p>Please select a state to see the COVID-19 data.</p>';
        return;
    }

    const currentData = await fetchCovidData(state);
    if (currentData) {
        const latestData = currentData[0];
        covidStatsDiv.innerHTML = `
            <h2>COVID-19 Data for ${state.toUpperCase()}</h2>
            <p>Confirmed Cases: ${latestData.positive}</p>
            <p>Hospitalizations: ${latestData.hospitalizedCurrently}</p>
            <p>Recoveries: ${latestData.recovered || 'N/A'}</p>
            <p>Deaths: ${latestData.death}</p>
        `;

        const dailyData = await fetchCovidData(state);
        if (dailyData) {
            const dates = dailyData.map(entry => entry.date.toString());
            const cases = dailyData.map(entry => entry.positive);
            drawChart(dates, cases);
        }
    }
});
