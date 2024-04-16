import React, { useEffect, useState } from "react";
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import electricCarIcon from './electric-car.png';
import youarehereIcon from './youarehere.png';
import SearchBar from "./SearchBar";
import { geoCodeAddress } from "../utilities/geoCodeUtil"; //import as
import { findClosestCharger } from "../utilities/geoCodeUtil";
import chargersData from "./chargers.json" // chargers (hardcoded locations)
import ToggleFavouritesButton from "./ToggleFavouritesButton";
import Notification from "./Notification"; // Import the Notification component
import { calculateDistance } from "../utilities/geoCodeUtil";



function Map() {

    const [closestCharger, setClosestCharger] = useState("");
    const [showFavourites, setShowFavourites] = useState(false);
    const [favourites, setFavourites] = useState([]);
    const [notification, setNotification] = useState(null); // Add state for notification
    const [latitude, setLatitude] = useState(null); 
    const [longitude, setLongitude] = useState(null); //needed to display distance of chargers from address
    const [map, setMap] = useState(null); // State for the Leaflet map object
    const [addressMarker, setAddressMarker] = useState(null); // State for the address marker



    // useEffect hook to read from local storage and update favourites state
    useEffect(() => {
        // Retrieve favourites from local storage
        const favouritesFromStorage = JSON.parse(localStorage.getItem('favourites')) || [];
        // Set favourites state
        setFavourites(favouritesFromStorage);
        
    }, []);

    const search = async (address) => {
        try {
            const { latitude, longitude } = await geoCodeAddress(address);

            setLatitude(latitude);
            setLongitude(longitude);

            // Filter chargers based on showFavourites state
            const chargersToSearch = showFavourites ? favourites : chargersData;
            //prevents searching all chargers on map when viewing favourites

            const chargersWithDistance = chargersToSearch.map(charger => {
                const distance = calculateDistance(latitude, longitude, charger.coordinates[0], charger.coordinates[1]);
                return { ...charger, distance };
            });
            setClosestCharger(findClosestCharger(latitude, longitude, chargersWithDistance));
        } catch (error) {
            console.error("Error searching", error);
        }
    };

    // adding a charger to favourites
    const addToFavourites = (charger) => {
        // Retrieve existing favourites from local storage
        const existingFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
    
        // Check if the charger already exists in favourites
        const isAlreadyAdded = existingFavourites.some(favourite => JSON.stringify(favourite) === JSON.stringify(charger));
    
        if (!isAlreadyAdded) {
            // Append the new favourite to the existing favourites array
            const updatedFavourites = [...existingFavourites, charger];
    
            // Save the updated favourites to local storage
            localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
    
            // Update state to reflect the change
            setFavourites(updatedFavourites);
        } else {
            console.log('Charger already in favourites');
        }

        setClosestCharger(""); // reset so map doesnt fly again after charger is added
        setNotification(`Charger "${charger.name}" added to favourites`);
    };

    // removing a charger from favourites
    const removeFromFavourites = (charger) => {
        const updatedFavourites = favourites.filter(favourite => JSON.stringify(favourite) !== JSON.stringify(charger));
        localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
        setFavourites(updatedFavourites);
        setClosestCharger(""); // reset so map doesnt fly again after charger is added
        // remove charger from favourites
        setNotification(`Charger "${charger.name}" removed from favourites`);
    };

    useEffect(() => {
        
        console.log("showFavourites state changed:", showFavourites); //test
        
        
        const map = L.map('map').setView([52.520008, 13.404954], 13); //leaflet map

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        if (latitude && longitude) {
            // remove previous address marker if exists
            if (addressMarker) {
                map.removeLayer(addressMarker);
            }
            // marker for address - shows where address is
            var img = new Image();
            img.src = youarehereIcon;
            var imgWidth = img.width;
            var imgHeight = img.height;
            var desiredHeight = 38;
            var aspectRatio = imgWidth / imgHeight;
            var desiredWidth = desiredHeight * aspectRatio;

            var hereIcon = L.icon({
                iconUrl: img.src,
                iconSize: [desiredWidth, desiredHeight], // size of the iconn
                iconAnchor: [20, 20] // point of the icon which will correspond to marker's location
            });

            const marker = L.marker([latitude, longitude], { icon: hereIcon }).addTo(map);
            setAddressMarker(marker);
        }
        // Filter chargers based on showFavourites state
        const chargersToShow = showFavourites ? favourites : chargersData;

        // custom EV icon for marker
        var img = new Image();
        img.src = electricCarIcon;
        var imgWidth = img.width;
        var imgHeight = img.height;

        // calculate width based on the desired height and the aspect ratio of icon
        var desiredHeight = 38;
        var aspectRatio = imgWidth / imgHeight;
        var desiredWidth = desiredHeight * aspectRatio;

        var greenIcon = L.icon({
            iconUrl: img.src,
            iconSize: [desiredWidth, desiredHeight], // size of the icon
            iconAnchor: [20, 20] // point of the icon which will correspond to marker's location
        });

        // Add markers for each charger
        chargersToShow.forEach(function (charger) {
            console.log("Charger:", charger);

            if(latitude || longitude !== null) // there is a lat/long = address is entered
            {
                const distance = calculateDistance(latitude, longitude, charger.coordinates[0], charger.coordinates[1]);
                charger.distance = distance;
            }
 

            var marker = L.marker(charger.coordinates, { icon: greenIcon }).addTo(map);
            
            // Create a DOM element for the button
            var button = document.createElement('button');
            button.classList.add('popupbutton');

            // Check if the charger is already in favourites
            const isFavourite = favourites.some(favourite => JSON.stringify(favourite) === JSON.stringify(charger));

            if (isFavourite) {
                button.textContent = 'Remove from Favourites';
                button.addEventListener('click', () => removeFromFavourites(charger));
            } else {
                button.textContent = 'Add to Favourites';
                button.addEventListener('click', () => addToFavourites(charger));
            }

            // Create the popup content with the button
            var popupContent = document.createElement('div');
            popupContent.innerHTML = "<b>" + charger.name + "</b><br>I am an EV charger.";

            
            if (charger.distance !== undefined) {
                popupContent.innerHTML += "<br>Distance away: " + charger.distance.toFixed(2) + " km"; // Display distance in kilometers with two decimal places
            }
            
            popupContent.appendChild(button);
   
            // Bind the popup with the content containing the button
            marker.bindPopup(popupContent, 
            {
                maxWidth: '200' // to fit on mobile screen
            });
        });

        // Focus on the closest charger
        if (closestCharger) {
            map.flyTo(closestCharger.coordinates, 17, {
                animate: true,
                duration: 1, // Adjust the duration for the animation
            });
        }

        // Return a cleanup function to remove the map when the component unmounts
        return () => {
            map.remove();
        };
    }, [closestCharger, showFavourites, favourites]); // included in the dependency array so useEffect re-runs when they change

    const toggleFavourites = () => { // toggle favourites filter on map
        console.log("Toggle favourites clicked");
        setShowFavourites(!showFavourites);
    };

    return (
        <div>
            <SearchBar onSearch={search} className="searchbar"></SearchBar>
            <ToggleFavouritesButton
                showFavourites={showFavourites}
                toggleFavourites={toggleFavourites}
                onClick={toggleFavourites}
                style={{ backgroundColor: 'blue', color: 'white' }}
            />
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />} {/* Render Notification component */}
            <div id="map"></div>
        </div>
    );
}

export default Map;