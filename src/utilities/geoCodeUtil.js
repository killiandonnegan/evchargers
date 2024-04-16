
async function geoCodeAddress(address) {

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    try
    {
        const response = await fetch(url);
        if (!response.ok)
        {
            throw new Error("Unable to fetch");
        }

        const data = await response.json();
        if(data.length > 0 )
        {
            const { lat, lon } = data[0];
            return { latitude: lat, longitude: lon };
        }
        else
        {
            throw new Error("No data fetched/found");
        }
    }
    catch (error)
    {
        console.error("Error with geocoding function", error);
        throw error;
    }
}



function calculateDistance(x1, y1, x2, y2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (x2 - x1) * (Math.PI / 180);
    const dLon = (y2 - y1) * (Math.PI / 180);

    const lat1Rad = x1 * (Math.PI / 180); // Convert latitude to radians
    const lat2Rad = x2 * (Math.PI / 180); // Convert latitude to radians

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function findClosestCharger(userLat, userLon, chargersData)
{
    const chargers = JSON.parse(JSON.stringify(chargersData));
    let minDistance = Infinity;
    let closestCharger = null;

    chargers.forEach(charger => {
        const distance = calculateDistance(userLat, userLon, charger.coordinates[0], charger.coordinates[1]);
        if (distance < minDistance) {
            minDistance = distance;
            closestCharger = charger;
            closestCharger.distance = minDistance; // Attach distance to closestCharger
        }
    });
    
    console.log(closestCharger);
    return closestCharger;
}

export { geoCodeAddress, findClosestCharger, calculateDistance };