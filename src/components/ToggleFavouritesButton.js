import React from 'react';

function ToggleFavouritesButton({ showFavourites, toggleFavourites, onClick }) {
    return (
        <button className="favouritesbutton" onClick={onClick}>
            {showFavourites ? 'Show All Chargers' : 'Show Favourite Chargers'}
        </button>
    );
}

export default ToggleFavouritesButton;
