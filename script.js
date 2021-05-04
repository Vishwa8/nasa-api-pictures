const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const saveConfirmationText = document.getElementById('save-confirmation-text');
const loader = document.querySelector('.loader');

const count = 10;
const apikey = 'DEMO_KEY';
const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apikey}&count=${count}`;

let resultsArray = [];
let favorites = {};

const showContent = (page) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (page === 'results') {
        resultsNav.classList.remove('hidden');
        favoritesNav.classList.add('hidden');
    } else {        
        resultsNav.classList.add('hidden');
        favoritesNav.classList.remove('hidden');
    }
    loader.classList.add('hidden');
};

const createDOMNodes = (page) => {
    const currentArray = page === 'results' ? resultsArray : Object.values(favorites);
    currentArray.forEach((result) => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const link = document.createElement('a');
        link.href = result.hdurl;
        link.title = 'View Full Image';
        link.target = '_blank';

        const image = document.createElement('img');
        image.src = result.url;
        image.alt = 'NASA Picture of the Day';
        image.loading = 'lazy';
        image.classList.add('card-img-top');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = result.title;

        const saveText = document.createElement('p');
        saveText.classList.add('clickable');
        if (page === 'results') {            
            saveText.textContent = 'Add to Favorites';
            saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
        } else {
            saveText.textContent = 'Remove Favorites';
            saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
        }

        const cardText = document.createElement('p');
        cardText.textContent = result.explanation;        

        const footer = document.createElement('small');
        footer.classList.add('text-muted');        

        const date = document.createElement('strong');
        date.textContent = result.date;        

        const copyright = document.createElement('span');
        copyright.textContent = result.copyright === undefined ? '' : ` ${result.copyright}`;

        footer.append(date, copyright);
        cardBody.append(cardTitle, saveText, cardText, footer);
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
};

const updateDOM = (page) => { 
    if (localStorage.getItem('favorites')) {
        favorites = JSON.parse(localStorage.getItem('favorites'));
    }   
    if (!resultsArray.length) return;
    imagesContainer.textContent = '';
    createDOMNodes(page); 
    showContent(page);
};

const getNasaPictures = async() => {
    loader.classList.remove('hidden');
    try {
        const response = await fetch(nasaApiUrl);
        resultsArray = await response.json();
        updateDOM('results');
    } catch (error) {
        console.log(error);
    }
};

const showSaveConfirm = (text) => {
    saveConfirmationText.textContent = text;
    saveConfirmed.hidden = false;
    setTimeout(() => {
        saveConfirmed.hidden = true; 
    }, 2000);
}

const saveFavorite = (itemUrl) => {
    resultsArray.forEach((item) => {
        if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
            favorites[itemUrl] = item;  
            localStorage.setItem('favorites', JSON.stringify(favorites));              
            showSaveConfirm("ADDED!");
        }
    });
}

const removeFavorite = (itemUrl) => {
    if (favorites[itemUrl]) {
        delete favorites[itemUrl];
    } 
    localStorage.setItem('favorites', JSON.stringify(favorites));              
    updateDOM('favorites');
}

getNasaPictures();