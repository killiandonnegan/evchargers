import React, { useState} from "react";
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

function SearchBar({ onSearch }) {  //takes onsearch passed from map component

    const [address, setAddress] = useState(""); //initially set address state to ""

    const search = () => {
        
        onSearch(address); //call onsearch from map component with entered address
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            search();
        }
    };

    return (
        <div className="searchbar">
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} onKeyPress={handleKeyPress}></input>
            <button onClick={search}>Search</button>
        </div>
    );
}

export default SearchBar;