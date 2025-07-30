// Global configuration
const CONFIG = {
    weatherAPI: 'https://api.open-meteo.com/v1/forecast',
    geocodingAPI: 'https://api.open-meteo.com/v1/geocoding',
    updateInterval: 300000, // 5 minutes
    locationCacheTime: 3600000 // 1 hour
};

// Global state
let appState = {
    currentWeather: null,
    currentLocation: null,
    outfitPrompt: '',
    selectedGender: 'female', // Default to female
    recommendedProducts: [],
    isLoading: false,
    steps: {
        location: false,
        weather: false,
        outfit: false,
        image: false
    }
};

// IndexedDB setup
const DB_NAME = 'AIOutfitDB';
const DB_VERSION = 1;
const STORE_NAME = 'likedOutfits';
let db;

async function openIndexedDB() {
    if (db && db.readyState === 'open') {
        console.log('IndexedDB: Connection already open, reusing.');
        return db;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('IndexedDB: Object store created');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB: Database opened successfully');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB: Database error:', event.target.errorCode);
            reject(event.target.error);
        };
    });
}

async function saveLikedOutfit(outfitData) {
    await openIndexedDB(); // Ensure DB is open before transaction

    if (!db) {
        console.error('IndexedDB not initialized after opening attempt.');
        return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Generate a unique ID for the outfit
    outfitData.id = `outfit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    outfitData.timestamp = Date.now();

    const request = store.add(outfitData);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log('IndexedDB: Outfit saved successfully:', outfitData.id);
            resolve(outfitData);
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Error saving outfit:', event.target.error);
            reject(event.target.error);
        };
    });
}

async function getLikedOutfits() {
    await openIndexedDB(); // Ensure DB is open before transaction

    if (!db) {
        console.error('IndexedDB not initialized after opening attempt.');
        return [];
    }

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log('IndexedDB: Liked outfits retrieved:', request.result);
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Error getting liked outfits:', event.target.error);
            reject(event.target.error);
        };
    });
}

async function deleteLikedOutfit(id) {
    await openIndexedDB(); // Ensure DB is open before transaction

    if (!db) {
        console.error('IndexedDB not initialized after opening attempt.');
        return;
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log('IndexedDB: Outfit deleted successfully:', id);
            resolve();
        };
        request.onerror = (event) => {
            console.error('IndexedDB: Error deleting outfit:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Amazon Affiliate Product Database
const AMAZON_PRODUCTS = {
    // Women's Clothing
    female: {
        winter_coat: {
            name: "Women's Winter Puffer Coat",
            price: "$89.99",
            image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-winter-coat",
            category: "outerwear"
        },
        spring_jacket: {
            name: "Lightweight Spring Jacket",
            price: "$49.99",
            image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-spring-jacket",
            category: "outerwear"
        },
        summer_blouse: {
            name: "Flowy Summer Blouse",
            price: "$29.99",
            image: "https://images.unsplash.com/photo-1564257577-3a0b6eaab773?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-summer-blouse",
            category: "tops"
        },
        jeans: {
            name: "High-Waisted Skinny Jeans",
            price: "$39.99",
            image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-jeans",
            category: "bottoms"
        },
        ankle_boots: {
            name: "Stylish Ankle Boots",
            price: "$69.99",
            image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-ankle-boots",
            category: "shoes"
        },
        sandals: {
            name: "Comfortable Summer Sandals",
            price: "$34.99",
            image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-sandals",
            category: "shoes"
        },
        umbrella: {
            name: "Compact Travel Umbrella",
            price: "$19.99",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/compact-umbrella",
            category: "accessories"
        },
        sunglasses: {
            name: "Trendy Sunglasses",
            price: "$24.99",
            image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/women-sunglasses",
            category: "accessories"
        }
    },
    // Men's Clothing
    male: {
        winter_jacket: {
            name: "Men's Winter Parka",
            price: "$99.99",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-winter-parka",
            category: "outerwear"
        },
        casual_jacket: {
            name: "Casual Spring Jacket",
            price: "$59.99",
            image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-casual-jacket",
            category: "outerwear"
        },
        polo_shirt: {
            name: "Classic Polo Shirt",
            price: "$24.99",
            image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-polo-shirt",
            category: "tops"
        },
        chinos: {
            name: "Slim Fit Chino Pants",
            price: "$34.99",
            image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-chinos",
            category: "bottoms"
        },
        sneakers: {
            name: "Casual Sneakers",
            price: "$79.99",
            image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-sneakers",
            category: "shoes"
        },
        boat_shoes: {
            name: "Classic Boat Shoes",
            price: "$54.99",
            image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-boat-shoes",
            category: "shoes"
        },
        cap: {
            name: "Baseball Cap",
            price: "$18.99",
            image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-baseball-cap",
            category: "accessories"
        },
        sunglasses: {
            name: "Classic Aviator Sunglasses",
            price: "$29.99",
            image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=300&h=300&fit=crop",
            affiliate: "https://amzn.to/men-sunglasses",
            category: "accessories"
        }
    }
};

// Weather code mappings for global use
const WEATHER_CODES = {
    0: { icon: '☀️', condition: 'Clear sky', severity: 'mild' },
    1: { icon: '🌤️', condition: 'Mainly clear', severity: 'mild' },
    2: { icon: '⛅', condition: 'Partly cloudy', severity: 'mild' },
    3: { icon: '☁️', condition: 'Overcast', severity: 'moderate' },
    45: { icon: '🌫️', condition: 'Fog', severity: 'moderate' },
    48: { icon: '🌫️', condition: 'Depositing rime fog', severity: 'moderate' },
    51: { icon: '🌦️', condition: 'Light drizzle', severity: 'moderate' },
    53: { icon: '🌦️', condition: 'Moderate drizzle', severity: 'moderate' },
    55: { icon: '🌧️', condition: 'Dense drizzle', severity: 'heavy' },
    56: { icon: '🌨️', condition: 'Light freezing drizzle', severity: 'heavy' },
    57: { icon: '🌨️', condition: 'Dense freezing drizzle', severity: 'heavy' },
    61: { icon: '🌧️', condition: 'Slight rain', severity: 'moderate' },
    63: { icon: '🌧️', condition: 'Moderate rain', severity: 'moderate' },
    65: { icon: '🌧️', condition: 'Heavy rain', severity: 'heavy' },
    66: { icon: '🌨️', condition: 'Light freezing rain', severity: 'heavy' },
    67: { icon: '🌨️', condition: 'Heavy freezing rain', severity: 'heavy' },
    71: { icon: '❄️', condition: 'Slight snow fall', severity: 'heavy' },
    73: { icon: '❄️', condition: 'Moderate snow fall', severity: 'heavy' },
    75: { icon: '❄️', condition: 'Heavy snow fall', severity: 'severe' },
    77: { icon: '🌨️', condition: 'Snow grains', severity: 'heavy' },
    80: { icon: '🌦️', condition: 'Slight rain showers', severity: 'moderate' },
    81: { icon: '🌧️', condition: 'Moderate rain showers', severity: 'moderate' },
    82: { icon: '⛈️', condition: 'Violent rain showers', severity: 'severe' },
    85: { icon: '🌨️', condition: 'Slight snow showers', severity: 'heavy' },
    86: { icon: '🌨️', condition: 'Heavy snow showers', severity: 'severe' },
    95: { icon: '⛈️', condition: 'Thunderstorm', severity: 'severe' },
    96: { icon: '⛈️', condition: 'Thunderstorm with slight hail', severity: 'severe' },
    99: { icon: '⛈️', condition: 'Thunderstorm with heavy hail', severity: 'severe' }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main app initialization
async function initializeApp() {
    console.log('🌍 AI Outfit for Today - Initializing global weather app...');
    console.log('DEBUG: Current page path:', window.location.pathname);

    const loadingSectionCheck = document.getElementById('loading-state'); // Changed from loading-section
    const weatherSectionCheck = document.getElementById('weather-section');
    const outfitSectionCheck = document.getElementById('outfit-section');
    const errorSectionCheck = document.getElementById('error-section');
    const imageDisplayCheck = document.getElementById('image-display');
    const imageActionsCheck = document.querySelector('.image-actions'); // Use querySelector for class

    console.log('DEBUG initializeApp: loadingSectionCheck', loadingSectionCheck);
    console.log('DEBUG initializeApp: weatherSectionCheck', weatherSectionCheck);
    console.log('DEBUG initializeApp: outfitSectionCheck', outfitSectionCheck);
    console.log('DEBUG initializeApp: errorSectionCheck', errorSectionCheck);
    console.log('DEBUG initializeApp: imageDisplayCheck', imageDisplayCheck);
    console.log('DEBUG initializeApp: imageActionsCheck', imageActionsCheck);

    // Only proceed with weather/outfit logic if we are on index.html
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        try {
            appState.isLoading = true;
            showLoadingState();

            // Initialize IndexedDB
            await openIndexedDB();
            
            // Step 1: Get user location
            updateLoadingStep('location', 'active');
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            appState.currentLocation = { latitude, longitude };
            updateLoadingStep('location', 'completed');
            
            // Step 2: Fetch weather data
            updateLoadingStep('weather', 'active');
            const weatherData = await fetchWeatherData(latitude, longitude);
            appState.currentWeather = weatherData;
            updateLoadingStep('weather', 'completed');
            
            // Step 3: Generate outfit recommendation
            updateLoadingStep('outfit', 'active');
            const outfitData = generateOutfitRecommendation(weatherData, appState.selectedGender);
            appState.outfitPrompt = outfitData.prompt;
            appState.recommendedProducts = outfitData.products;
            updateLoadingStep('outfit', 'completed');
            
            // Step 4: Prepare image generation
            updateLoadingStep('image', 'active');
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
            updateLoadingStep('image', 'completed');
            
            // Get location name for display
            const locationName = await getLocationName(latitude, longitude);
            
            // Update UI with all data
            await updateWeatherUI(weatherData, locationName);
            updateOutfitUI(outfitData);
            
            // Show main content
            hideLoadingState();
            showMainContent();
            
            appState.isLoading = false;
            console.log('✅ App initialized successfully');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            handleAppError(error);
            appState.isLoading = false;
        }
    } else if (window.location.pathname === '/liked.html') {
        // For liked.html, only initialize IndexedDB and display liked outfits
        console.log('DEBUG: Initializing for liked.html');
        try {
            await openIndexedDB();
            await displayLikedOutfits();
            // Hide any loading states that might appear on liked.html if not explicitly handled
            hideLoadingState(); 
        } catch (error) {
            console.error('❌ Liked page initialization failed:', error);
            // Display an error message on the liked page if something goes wrong
            const likedImagesGrid = document.getElementById('liked-images-grid');
            if (likedImagesGrid) {
                likedImagesGrid.innerHTML = '<p class="error-message">Failed to load liked images due to an error.</p>';
            }
        }
    }
}

async function initializeLikedOutfitsPage() {
    console.log('DEBUG: Initializing for liked.html');
    try {
        // Add a small delay to ensure DOM is fully ready, even with defer
        await new Promise(resolve => setTimeout(resolve, 50)); 

        await openIndexedDB();
        await displayLikedOutfits();
        // Hide any loading states that might appear on liked.html if not explicitly handled
        hideLoadingState(); 
    } catch (error) {
        console.error('❌ Liked page initialization failed:', error);
        // Display an error message on the liked page if something goes wrong
        const likedImagesGrid = document.getElementById('liked-images-grid');
        if (likedImagesGrid) {
            likedImagesGrid.innerHTML = '<p class="error-message">Failed to load liked images due to an error.</p>';
        }
    }
}

// Get current position with enhanced error handling
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: CONFIG.locationCacheTime
        };
        
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('📍 Location detected:', position.coords.latitude, position.coords.longitude);
                resolve(position);
            },
            error => {
                console.error('❌ Geolocation error:', error);
                let errorMessage = 'Unable to detect location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location access and refresh the page.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

// Fetch comprehensive weather data from Open-Meteo API
async function fetchWeatherData(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'weather_code',
            'wind_speed_10m',
            'wind_direction_10m'
        ].join(','),
        hourly: 'temperature_2m,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        timezone: 'auto',
        forecast_days: 1
    });
    
    const url = `${CONFIG.weatherAPI}?${params}`;
    console.log('🌡️ Fetching weather data from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Weather data received:', data);
    
    return {
        current: data.current,
        daily: data.daily,
        timezone: data.timezone,
        location: { latitude, longitude }
    };
}

// Get location name using reverse geocoding
async function getLocationName(latitude, longitude) {
    try {
        // Use a simple approach to get timezone-based location
        const weatherResponse = await fetch(
            `${CONFIG.weatherAPI}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto&forecast_days=1`
        );
        const weatherData = await weatherResponse.json();
        
        if (weatherData.timezone) {
            // Extract city name from timezone (e.g., "America/New_York" -> "New York")
            const timezoneParts = weatherData.timezone.split('/');
            const cityName = timezoneParts[timezoneParts.length - 1].replace(/_/g, ' ');
            return cityName || 'Your Location';
        }
        
        return 'Your Location';
    } catch (error) {
        console.warn('⚠️ Could not get location name:', error);
        return 'Your Location';
    }
}

// Generate comprehensive outfit recommendation based on gender
function generateOutfitRecommendation(weatherData, gender = 'female') {
    const current = weatherData.current;
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const weatherCode = current.weather_code;
    const windSpeed = current.wind_speed_10m;
    
    const weather = WEATHER_CODES[weatherCode] || WEATHER_CODES[1];
    
    console.log('👔 Generating outfit for:', { temp, feelsLike, humidity, weatherCode, weather: weather.condition });
    
    // Determine base clothing based on temperature
    let clothing = [];
    let footwear = [];
    let accessories = [];
    let style = 'casual';
    let colors = [];
    
    // Temperature-based clothing selection with gender preferences
    if (temp <= -10) {
        if (gender === 'female') {
            clothing = ['heavy winter coat', 'thermal leggings', 'wool sweater', 'warm scarf', 'winter hat', 'insulated gloves'];
            footwear = ['insulated winter boots', 'warm wool socks'];
            style = 'cozy arctic winter';
            colors = ['deep burgundy', 'charcoal gray', 'winter white'];
        } else {
            clothing = ['heavy winter parka', 'thermal underwear', 'wool pullover', 'insulated pants', 'warm scarf', 'beanie', 'winter gloves'];
            footwear = ['insulated winter boots', 'thick wool socks'];
            style = 'rugged arctic winter';
            colors = ['dark navy', 'charcoal black', 'forest green'];
        }
    } else if (temp <= 0) {
        if (gender === 'female') {
            clothing = ['stylish winter coat', 'warm sweater', 'skinny jeans or leggings', 'fashionable scarf', 'cute beanie'];
            footwear = ['fashionable winter boots', 'warm socks'];
            style = 'chic winter';
            colors = ['camel', 'burgundy', 'cream white'];
        } else {
            clothing = ['winter jacket', 'warm hoodie or sweater', 'jeans', 'warm scarf', 'knit beanie'];
            footwear = ['winter boots', 'thick socks'];
            style = 'casual winter';
            colors = ['navy blue', 'forest green', 'charcoal'];
        }
    } else if (temp <= 10) {
        if (gender === 'female') {
            clothing = ['trench coat or stylish jacket', 'cozy sweater', 'jeans or cute pants', 'light scarf'];
            footwear = ['ankle boots or sneakers'];
            style = 'elegant autumn';
            colors = ['camel', 'rust orange', 'olive green'];
        } else {
            clothing = ['casual jacket or hoodie', 'long-sleeve shirt', 'chinos or jeans', 'light scarf'];
            footwear = ['casual boots or sneakers'];
            style = 'relaxed autumn';
            colors = ['earth tones', 'burgundy', 'navy'];
        }
    } else if (temp <= 15) {
        if (gender === 'female') {
            clothing = ['light cardigan or blazer', 'blouse or long-sleeve top', 'jeans or stylish pants'];
            footwear = ['flats or low heels', 'comfortable sneakers'];
            style = 'spring chic';
            colors = ['soft pink', 'light blue', 'sage green'];
        } else {
            clothing = ['light jacket or cardigan', 'button-down shirt', 'chinos or jeans'];
            footwear = ['loafers or sneakers'];
            style = 'smart casual spring';
            colors = ['light gray', 'navy', 'khaki'];
        }
    } else if (temp <= 20) {
        if (gender === 'female') {
            clothing = ['light sweater or blouse', 'comfortable jeans or pants', 'light cardigan'];
            footwear = ['comfortable flats or sneakers'];
            style = 'casual spring';
            colors = ['coral', 'mint green', 'soft yellow'];
        } else {
            clothing = ['polo shirt or casual shirt', 'chinos or jeans'];
            footwear = ['casual shoes or sneakers'];
            style = 'relaxed spring';
            colors = ['light blue', 'khaki', 'white'];
        }
    } else if (temp <= 25) {
        if (gender === 'female') {
            clothing = ['cute t-shirt or blouse', 'jeans or stylish pants', 'light cardigan'];
            footwear = ['sandals or comfortable sneakers'];
            style = 'fresh casual';
            colors = ['bright coral', 'turquoise', 'sunny yellow'];
        } else {
            clothing = ['casual t-shirt or polo', 'shorts or light pants'];
            footwear = ['sneakers or casual shoes'];
            style = 'comfortable casual';
            colors = ['navy', 'khaki', 'white'];
        }
    } else if (temp <= 30) {
        if (gender === 'female') {
            clothing = ['tank top or summer blouse', 'shorts or summer dress', 'light cardigan'];
            footwear = ['sandals or summer sneakers'];
            style = 'breezy summer';
            colors = ['bright summer colors', 'coral pink', 'turquoise'];
        } else {
            clothing = ['breathable t-shirt', 'shorts', 'light shirt'];
            footwear = ['sneakers or boat shoes'];
            style = 'summer casual';
            colors = ['light blue', 'white', 'khaki'];
        }
    } else {
        if (gender === 'female') {
            clothing = ['breathable tank top or summer top', 'shorts or light summer dress', 'sun hat'];
            footwear = ['comfortable sandals'];
            style = 'hot summer chic';
            colors = ['white', 'light pastels', 'bright coral'];
        } else {
            clothing = ['lightweight t-shirt', 'shorts', 'sun hat or cap'];
            footwear = ['breathable sneakers or sandals'];
            style = 'hot summer casual';
            colors = ['white', 'light gray', 'navy'];
        }
    }
    
    // Weather condition adjustments
    if (weather.severity === 'heavy' || weather.severity === 'severe') {
        if (weatherCode >= 61 && weatherCode <= 67) { // Rain
            accessories.push('umbrella', 'waterproof jacket');
            footwear = ['waterproof shoes or boots'];
        } else if (weatherCode >= 71 && weatherCode <= 77) { // Snow
            accessories.push('warm hat', 'insulated gloves');
            footwear = ['insulated waterproof boots'];
        } else if (weatherCode >= 95) { // Thunderstorm
            accessories.push('waterproof jacket', 'sturdy umbrella');
        }
    } else if (weather.severity === 'moderate') {
        if (weatherCode >= 51 && weatherCode <= 55) { // Drizzle
            accessories.push('light rain jacket');
        }
    }
    
    // Wind adjustments
    if (windSpeed > 20) {
        accessories.push('windproof outer layer');
    }
    
    // Humidity adjustments
    if (humidity > 80) {
        clothing = clothing.map(item => item.includes('breathable') ? item : `breathable ${item}`);
        style = `lightweight ${style}`;
    }
    
    // Sunny weather accessories
    if (weatherCode <= 1) {
        accessories.push('sunglasses');
        if (temp > 20) accessories.push('sun hat');
    }
    
    // Generate detailed AI prompt focused on person wearing outfit
    const personDescriptions = {
        female: ['young woman', 'stylish woman', 'fashionable lady', 'elegant female model'],
        male: ['young man', 'stylish man', 'fashionable gentleman', 'handsome male model']
    };
    const selectedPerson = personDescriptions[gender][Math.floor(Math.random() * personDescriptions[gender].length)];
    const selectedColor = colors[Math.floor(Math.random() * colors.length)] || 'stylish colors';
    
    const promptParts = [
        `A ${selectedPerson} modeling and wearing`,
        clothing.slice(0, 4).join(', '), // Limit to avoid overly long prompts
        footwear.join(' and '),
        accessories.length > 0 ? `with ${accessories.slice(0, 3).join(', ')}` : '',
        `in ${selectedColor}`,
        `${style} fashion outfit`,
        `posing for a fashion photoshoot`,
        `outdoors in ${weather.condition.toLowerCase()} weather`,
        `${temp}°C temperature`,
        'professional fashion photography',
        'portrait style',
        'person clearly visible',
        'human model',
        'fashion model pose',
        'full body shot showing complete outfit',
        'realistic human proportions',
        'detailed clothing textures'
    ].filter(Boolean);
    
    const aiPrompt = promptParts.join(', ');
    
    // Generate human-readable summary
    const summary = `Perfect for ${temp}°C ${weather.condition.toLowerCase()} weather. ${
        temp <= 10 ? 'Layer up to stay warm and cozy.' :
        temp <= 20 ? 'Light layers for comfortable temperature control.' :
        temp <= 30 ? 'Breathable fabrics to stay cool and comfortable.' :
        'Light, airy clothing to beat the heat.'
    }`;
    
    // Generate Amazon product recommendations
    const recommendedProducts = generateProductRecommendations(temp, weatherCode, gender);
    
    return {
        prompt: aiPrompt,
        summary: summary,
        clothing: clothing.slice(0, 3).join(', '),
        footwear: footwear[0] || 'comfortable shoes',
        accessories: accessories.length > 0 ? accessories.slice(0, 2).join(', ') : 'none needed',
        style: style,
        temperature: temp,
        weatherCondition: weather.condition,
        products: recommendedProducts
    };
}

// Update weather UI with comprehensive information
async function updateWeatherUI(weatherData, locationName) {
    const current = weatherData.current;
    const weather = WEATHER_CODES[current.weather_code] || WEATHER_CODES[1];
    
    // Update weather display
    const weatherIconElement = document.getElementById('weather-icon');
    const temperatureElement = document.getElementById('temperature');
    const weatherConditionElement = document.getElementById('weather-condition');
    const feelsLikeElement = document.getElementById('feels-like');
    const humidityElement = document.getElementById('humidity');
    const locationNameElement = document.getElementById('location-name');
    const localTimeElement = document.getElementById('local-time');

    if (weatherIconElement) weatherIconElement.textContent = weather.icon;
    if (temperatureElement) temperatureElement.textContent = `${Math.round(current.temperature_2m)}°C`;
    if (weatherConditionElement) weatherConditionElement.textContent = weather.condition;
    if (feelsLikeElement) feelsLikeElement.textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
    if (humidityElement) humidityElement.textContent = `Humidity ${current.relative_humidity_2m}%`;
    if (locationNameElement) locationNameElement.textContent = `📍 ${locationName}`;
    
    // Update local time
    try {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
        if (localTimeElement) localTimeElement.textContent = `🕐 ${timeString}`;
    } catch (error) {
        if (localTimeElement) localTimeElement.textContent = '�� Local time';
    }
}

// Generate Amazon product recommendations based on weather
function generateProductRecommendations(temp, weatherCode, gender) {
    console.log('🛍️ Generating products for:', { temp, weatherCode, gender });
    
    const products = [];
    const genderProducts = AMAZON_PRODUCTS[gender];
    
    if (!genderProducts) {
        console.error('❌ No products found for gender:', gender);
        return [];
    }
    
    console.log('✅ Available products for', gender, ':', Object.keys(genderProducts));
    
    // Temperature-based recommendations
    if (temp <= 0) {
        // Winter products
        if (gender === 'female') {
            if (genderProducts.winter_coat) products.push(genderProducts.winter_coat);
            if (genderProducts.ankle_boots) products.push(genderProducts.ankle_boots);
        } else {
            if (genderProducts.winter_jacket) products.push(genderProducts.winter_jacket);
            if (genderProducts.sneakers) products.push(genderProducts.sneakers);
        }
    } else if (temp <= 15) {
        // Spring/Fall products
        if (gender === 'female') {
            if (genderProducts.spring_jacket) products.push(genderProducts.spring_jacket);
            if (genderProducts.jeans) products.push(genderProducts.jeans);
            if (genderProducts.ankle_boots) products.push(genderProducts.ankle_boots);
        } else {
            if (genderProducts.casual_jacket) products.push(genderProducts.casual_jacket);
            if (genderProducts.chinos) products.push(genderProducts.chinos);
            if (genderProducts.sneakers) products.push(genderProducts.sneakers);
        }
    } else if (temp <= 25) {
        // Mild weather products
        if (gender === 'female') {
            if (genderProducts.summer_blouse) products.push(genderProducts.summer_blouse);
            if (genderProducts.jeans) products.push(genderProducts.jeans);
            if (genderProducts.sandals) products.push(genderProducts.sandals);
        } else {
            if (genderProducts.polo_shirt) products.push(genderProducts.polo_shirt);
            if (genderProducts.chinos) products.push(genderProducts.chinos);
            if (genderProducts.boat_shoes) products.push(genderProducts.boat_shoes);
        }
    } else {
        // Hot weather products
        if (gender === 'female') {
            if (genderProducts.summer_blouse) products.push(genderProducts.summer_blouse);
            if (genderProducts.sandals) products.push(genderProducts.sandals);
        } else {
            if (genderProducts.polo_shirt) products.push(genderProducts.polo_shirt);
            if (genderProducts.boat_shoes) products.push(genderProducts.boat_shoes);
        }
    }
    
    // Weather-specific accessories
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
        // Rainy weather
        const umbrella = genderProducts.umbrella || AMAZON_PRODUCTS.female.umbrella;
        if (umbrella) products.push(umbrella);
    }
    
    if ([0, 1].includes(weatherCode) && temp > 15) {
        // Sunny weather
        if (genderProducts.sunglasses) products.push(genderProducts.sunglasses);
        if (gender === 'male' && temp > 20 && genderProducts.cap) {
            products.push(genderProducts.cap);
        }
    }
    
    // Remove duplicates and limit to 4 products
    const uniqueProducts = products.filter((product, index, self) => 
        product && index === self.findIndex(p => p && p.name === product.name)
    ).slice(0, 4);
    
    console.log('🎯 Final recommended products:', uniqueProducts.length, uniqueProducts.map(p => p.name));
    
    return uniqueProducts;
}

// Note: updateOutfitUI function moved to bottom with gender support

// Generate AI outfit image directly in the app
async function generateOutfitImage() {
    if (!appState.outfitPrompt) {
        alert('Please wait for the outfit recommendation to load first.');
        return;
    }
    
    console.log('🎨 Generating AI image with prompt:', appState.outfitPrompt);
    
    // Show loading state
    const generateBtn = document.getElementById('generate-image-btn');
    const originalContent = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generating Image...</span>';
    generateBtn.disabled = true;
    
    try {
        // Wait for DOM to be ready and get the existing image container
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
        
        let imageContainer = document.getElementById('generated-image-container');
        if (!imageContainer) {
            console.warn('⚠️ Image container not found, creating it...');
            console.log('📋 Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
            
            // Create the container if it doesn't exist
            imageContainer = document.createElement('div');
            imageContainer.id = 'generated-image-container';
            imageContainer.className = 'generated-image-container';
            imageContainer.style.display = 'none';
            
            // Find a good place to insert it (after the generate button)
            const generateBtn = document.getElementById('generate-image-btn');
            if (generateBtn && generateBtn.parentNode) {
                generateBtn.parentNode.insertBefore(imageContainer, generateBtn.nextSibling);
            } else {
                // Fallback: append to outfit section
                const outfitSection = document.getElementById('outfit-section');
                if (outfitSection) {
                    outfitSection.appendChild(imageContainer);
                }
            }
        }
        
        console.log('✅ Found image container:', imageContainer);
        
        // Show the container with high visibility
        imageContainer.style.display = 'block';
        imageContainer.style.visibility = 'visible';
        imageContainer.style.opacity = '1';
        imageContainer.style.position = 'relative';
        imageContainer.style.zIndex = '1000';
        
        console.log('🎯 Container made visible with styles:', {
            display: imageContainer.style.display,
            visibility: imageContainer.style.visibility,
            opacity: imageContainer.style.opacity
        });
        
        // Show loading placeholders immediately
        console.log('🎬 Showing loading placeholders...');
        const loadingPlaceholders = Array(2).fill(0).map((_, index) => `
            <div class="generated-image-item" style="animation-delay: ${index * 0.2}s;">
                <div class="image-wrapper loading">
                    <div class="image-loading-overlay">
                        <div class="loading-spinner-small"></div>
                        <div class="loading-text-small">🎨 Creating...</div>
                        <div class="loading-progress-small">
                            <div class="loading-progress-fill-small"></div>
                        </div>
                    </div>
                </div>
                <p class="image-description">Generating AI outfit image...</p>
                <p class="image-usage">Please wait</p>
            </div>
        `).join('');
        
        // Just show the loading placeholders without the big popup
        imageContainer.innerHTML = `
            <div class="generated-images-header">
                <h4>🎨 Creating Your AI-Generated Outfit</h4>
                <p>Perfect for today's weather conditions</p>
            </div>
            <div class="generated-images-grid">
                ${loadingPlaceholders}
            </div>
        `;
        
        console.log('📦 Container HTML set, checking visibility...');
        console.log('📏 Container dimensions:', imageContainer.getBoundingClientRect());
        console.log('👀 Container styles:', window.getComputedStyle(imageContainer));
        
        // Force scroll to container
        imageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Verify the loading element was created
        const loadingElement = imageContainer.querySelector('.image-loading');
        if (loadingElement) {
            console.log('✅ Loading element created successfully');
            console.log('📏 Loading element dimensions:', loadingElement.getBoundingClientRect());
            console.log('🎯 Container parent:', imageContainer.parentElement);
            console.log('👀 Container visible:', imageContainer.offsetHeight > 0 && imageContainer.offsetWidth > 0);
        } else {
            console.error('❌ Loading element not found!');
        }
        
        // Force scroll to the loading animation
        imageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Generate multiple AI images using different free services
        // Add progressive loading messages for better UX
        const loadingMessages = [
            { text: '🎨 Analyzing your outfit style...', subtext: 'Processing weather and preferences' },
            { text: '🧠 Generating AI prompt...', subtext: 'Creating detailed description' },
            { text: '✨ Creating your images...', subtext: 'AI is painting your perfect look' },
            { text: '🖼️ Finalizing results...', subtext: 'Almost ready!' }
        ];
        
        // Update loading messages progressively
        const updateLoadingMessage = (index) => {
            if (index < loadingMessages.length) {
                const message = loadingMessages[index];
                const loadingDiv = imageContainer.querySelector('.image-loading');
                if (loadingDiv) {
                    loadingDiv.querySelector('.loading-text').textContent = message.text;
                    loadingDiv.querySelector('.loading-subtext').textContent = message.subtext;
                }
            }
        };
        
        // Start image generation and progressive messages
        const imagePromise = generateMultipleImages(appState.outfitPrompt);
        
        // Update messages every 500ms
        for (let i = 0; i < loadingMessages.length; i++) {
            setTimeout(() => updateLoadingMessage(i), i * 500);
        }
        
        // Wait for both image generation and minimum loading time
        const [imageResults] = await Promise.all([
            imagePromise,
            new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2 second loading
        ]);
        
        if (imageResults.length > 0) {
            displayGeneratedImages(imageResults, imageContainer, appState.outfitPrompt);
        } else {
            // Show error message instead of external service
            imageContainer.innerHTML = `
                <div class="image-error" style="
                    background: #fee2e2;
                    border: 2px solid #fca5a5;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 20px 0;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h4 style="color: #dc2626; margin-bottom: 12px;">Image Generation Failed</h4>
                    <p style="color: #7f1d1d; margin-bottom: 20px;">Unable to generate images at this time. Please try again.</p>
                    <button onclick="generateOutfitImage()" style="
                        background: #dc2626;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        🔄 Try Again
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ Image generation failed:', error);
        showImageGenerationError(imageContainer);
    } finally {
        // Restore button
        generateBtn.innerHTML = originalContent;
        generateBtn.disabled = false;
    }
}

// Generate images using multiple free AI services focused on people
async function generateMultipleImages(prompt) {
    const imageResults = [];
    
    try {
        // Add multiple layers of randomization for unique images
        const timestamp = Date.now();
        const randomSeed = Math.floor(Math.random() * 1000000);
        const sessionId = Math.random().toString(36).substring(7);
        
        // Multiple style variations for more diversity
        const styleVariations = [
            'professional fashion model',
            'stylish person',
            'elegant individual',
            'fashionable model',
            'trendy fashion influencer',
            'sophisticated dresser',
            'chic fashion enthusiast',
            'modern style icon'
        ];
        
        const backgroundVariations = [
            'urban street background',
            'modern studio setting',
            'outdoor natural lighting',
            'minimalist backdrop',
            'city environment',
            'contemporary setting'
        ];
        
        const poseVariations = [
            'confident pose',
            'casual stance',
            'elegant posture',
            'dynamic pose',
            'relaxed position',
            'fashion pose'
        ];
        
        const selectedStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];
        const selectedBackground = backgroundVariations[Math.floor(Math.random() * backgroundVariations.length)];
        const selectedPose = poseVariations[Math.floor(Math.random() * poseVariations.length)];
        
        const enhancedPrompt = `${selectedStyle} ${prompt}, ${selectedPose}, ${selectedBackground}, no objects only, no clothing items only, must show person wearing clothes, human figure required, fashion model, person visible, realistic photography, high quality, detailed`;
        
        // Method 1: Use Pollinations AI with Flux model
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=768&model=flux&enhance=true&nologo=true&seed=${randomSeed}&timestamp=${timestamp}&session=${sessionId}`;
        imageResults.push({
            url: pollinationsUrl,
            service: 'Pollinations AI (Flux)',
            description: 'AI-generated person wearing recommended outfit',
            license: 'AI-generated content, no traditional copyright',
            usage: 'Free for personal and commercial use'
        });
        
        // Method 2: Alternative with completely different approach
        const altStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];
        const altBackground = backgroundVariations[Math.floor(Math.random() * backgroundVariations.length)];
        const altPose = poseVariations[Math.floor(Math.random() * poseVariations.length)];
        
        const altPrompt = `${altStyle} wearing ${prompt}, ${altPose}, ${altBackground}, photorealistic, high fashion, professional photography, detailed clothing, person clearly visible, full body shot`;
        const pollinationsUrl2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(altPrompt)}?width=512&height=768&model=turbo&enhance=true&seed=${randomSeed + 999}&timestamp=${timestamp + 1000}&session=${sessionId}_alt`;
        imageResults.push({
            url: pollinationsUrl2,
            service: 'Pollinations AI (Turbo)',
            description: 'Alternative fashion model in weather-appropriate outfit',
            license: 'AI-generated content, no traditional copyright',
            usage: 'Free for personal and commercial use'
        });
        
        console.log('🎨 Generated image URLs with randomization:', imageResults.map(r => r.url));
        
    } catch (error) {
        console.error('Error generating images:', error);
    }
    
    return imageResults;
}

// Display generated images in the UI
function displayGeneratedImages(imageResults, container, outfitPrompt) {
    const imagesHTML = imageResults.map((result, index) => `
        <div class="generated-image-item" style="animation-delay: ${index * 0.2}s">
            <div class="image-wrapper loading">
                <!-- Loading Animation -->
                <div class="image-loading-overlay">
                    <div class="loading-spinner-small"></div>
                    <div class="loading-text-small">🎨 Loading...</div>
                    <div class="loading-progress-small">
                        <div class="loading-progress-fill-small"></div>
                    </div>
                </div>
                
                <img src="${result.url}" alt="${result.description}" 
                     onload="this.parentElement.classList.remove('loading'); this.parentElement.classList.add('loaded')"
                     onerror="this.parentElement.classList.remove('loading'); this.parentElement.classList.add('error')">
                <div class="image-overlay">
                    <div class="image-service">${result.service}</div>
                    <div class="image-license">${result.license || 'AI-generated'}</div>
                </div>
            </div>
            <p class="image-description">${result.description}</p>
            <p class="image-usage">${result.usage || 'Free to use'}</p>
            <button class="like-button" data-image-url="${result.url}" data-prompt="${outfitPrompt}">❤️ Like</button>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="generated-images-header">
            <h4>🎨 Your AI-Generated Outfit</h4>
            <p>Perfect for today's weather conditions</p>
        </div>
        <div class="generated-images-grid">
            ${imagesHTML}
        </div>
        <div class="image-actions">
            <button onclick="generateOutfitImage()" class="regenerate-btn">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Generate New Images</span>
            </button>
        </div>
    `;

    // Attach event listeners to like buttons
    container.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const imageUrl = event.target.dataset.imageUrl;
            const prompt = event.target.dataset.prompt;
            const likedOutfit = {
                imageUrl: imageUrl,
                prompt: prompt,
                gender: appState.selectedGender,
                timestamp: Date.now()
            };
            try {
                await saveLikedOutfit(likedOutfit);
                event.target.textContent = '❤️ Liked!';
                event.target.disabled = true;
                // displayLikedOutfits(); // Refresh liked outfits display - removed as liked images are on a separate page
            } catch (error) {
                console.error('Error liking image:', error);
                alert('Failed to save liked image. Please try again.');
            }
        });
    });
}

// Function to display generated images
async function displayGeneratedImage(imageUrl, prompt) {
    const aiGeneratedImage = document.getElementById('ai-generated-image');
    const imagePromptDisplay = document.getElementById('image-prompt-display');
    const imageDisplay = document.getElementById('image-display');
    const imageActions = document.querySelector('.image-actions'); // Use querySelector for class

    console.log('DEBUG displayGeneratedImage: aiGeneratedImage', aiGeneratedImage);
    console.log('DEBUG displayGeneratedImage: imagePromptDisplay', imagePromptDisplay);
    console.log('DEBUG displayGeneratedImage: imageDisplay', imageDisplay);
    console.log('DEBUG displayGeneratedImage: imageActions', imageActions);

    if (aiGeneratedImage) {
        aiGeneratedImage.src = imageUrl;
        aiGeneratedImage.classList.remove('hidden');
    }
    if (imagePromptDisplay) {
        imagePromptDisplay.textContent = prompt;
        imagePromptDisplay.classList.remove('hidden');
    }
    if (imageDisplay) {
        imageDisplay.classList.remove('hidden');
    }
    if (imageActions) {
        imageActions.classList.remove('hidden'); // Ensure buttons are visible
    }
}

// Function to display liked images
async function displayLikedOutfits() {
    const likedImagesGrid = document.getElementById('liked-images-grid');
    const noLikedImagesMessage = document.getElementById('no-liked-images');
    const likedImagesSection = document.getElementById('liked-images-section');

    console.log('DEBUG displayLikedOutfits: Checking elements...');
    console.log('DEBUG displayLikedOutfits: document.readyState', document.readyState);
    console.log('DEBUG displayLikedOutfits: likedImagesGrid', likedImagesGrid);
    console.log('DEBUG displayLikedOutfits: noLikedImagesMessage', noLikedImagesMessage);
    console.log('DEBUG displayLikedOutfits: likedImagesSection', likedImagesSection);
    console.log('DEBUG displayLikedOutfits: body innerHTML snippet', document.body.innerHTML.substring(document.body.innerHTML.indexOf('<section id="liked-images-section"'), document.body.innerHTML.indexOf('</section>') + 10));

    if (!likedImagesGrid || !noLikedImagesMessage || !likedImagesSection) {
        console.error('Required elements for liked images display not found.');
        return;
    }

    try {
        const likedOutfits = await getLikedOutfits();

        if (likedOutfits.length === 0) {
            likedImagesGrid.innerHTML = ''; // Clear grid
            noLikedImagesMessage.style.display = 'block'; // Show message
            likedImagesSection.classList.add('hidden'); // Hide section if no images
            return;
        }

        // Sort by most recent
        likedOutfits.sort((a, b) => b.timestamp - a.timestamp);

        const likedImagesHTML = likedOutfits.map(outfit => `
            <div class="liked-image-item" data-id="${outfit.id}">
                <img src="${outfit.imageUrl}" alt="${outfit.prompt}" class="liked-image">
                <div class="liked-image-overlay">
                    <p class="liked-image-prompt">${outfit.prompt}</p>
                    <button class="unlike-button" data-id="${outfit.id}">🗑️ Unlike</button>
                </div>
            </div>
        `).join('');

        likedImagesGrid.innerHTML = likedImagesHTML;
        noLikedImagesMessage.style.display = 'none'; // Hide message
        likedImagesSection.classList.remove('hidden'); // Show section

        // Attach event listeners to unlike buttons
        likedImagesGrid.querySelectorAll('.unlike-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                const outfitId = event.target.dataset.id;
                const likedImageItem = event.target.closest('.liked-image-item'); // Get the parent item
                try {
                    await deleteLikedOutfit(outfitId);
                    if (likedImageItem) {
                        likedImageItem.remove(); // Immediately remove from DOM
                        console.log('DEBUG: Successfully removed liked image item from DOM.', outfitId);
                    }
                    // After removing, re-check if there are any liked outfits left to update the empty message
                    const remainingOutfits = await getLikedOutfits();
                    if (remainingOutfits.length === 0) {
                        if (noLikedImagesMessage) {
                            noLikedImagesMessage.style.display = 'block';
                        }
                        if (likedImagesGrid) {
                            likedImagesGrid.innerHTML = ''; // Ensure grid is empty
                        }
                        if (likedImagesSection) {
                            likedImagesSection.classList.add('hidden');
                        }
                    }

                } catch (error) {
                    console.error('Error unliking image:', error);
                    alert('Failed to remove liked image. Please try again.');
                }
            });
        });

    } catch (error) {
        console.error('Error displaying liked outfits:', error);
        // Safely try to update if elements exist for error message
        if (likedImagesGrid) {
            likedImagesGrid.innerHTML = '<p class="error-message">Failed to load liked images.</p>';
        }
        if (noLikedImagesMessage) {
            noLikedImagesMessage.style.display = 'none';
        }
        if (likedImagesSection) {
            likedImagesSection.classList.remove('hidden');
        }
    }
}

// Show image generation error
function showImageGenerationError(container) {
    container.innerHTML = `
        <div class="image-error">
            <div class="error-icon">⚠️</div>
            <h4>Image Generation Temporarily Unavailable</h4>
            <p>Please try generating images again in a few moments</p>
            <button onclick="generateOutfitImage()" class="retry-btn">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Try Again</span>
            </button>
        </div>
    `;
}

// Copy prompt to clipboard
function copyPromptToClipboard() {
    navigator.clipboard.writeText(appState.outfitPrompt).then(() => {
        const copyHint = document.querySelector('.copy-hint');
        if (copyHint) {
            copyHint.textContent = 'Copied!';
            setTimeout(() => {
                copyHint.textContent = 'Click to copy';
            }, 2000);
        }
    });
}

// Loading state management
function showLoadingState() {
    const loadingSection = document.getElementById('loading-section');
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');
    const errorSection = document.getElementById('error-section');

    console.log('DEBUG showLoadingState: loadingSection', loadingSection);
    console.log('DEBUG showLoadingState: weatherSection', weatherSection);
    console.log('DEBUG showLoadingState: outfitSection', outfitSection);
    console.log('DEBUG showLoadingState: errorSection', errorSection);

    if (loadingSection) loadingSection.classList.remove('hidden');
    if (weatherSection) weatherSection.classList.add('hidden');
    if (outfitSection) outfitSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function hideLoadingState() {
    const loadingSection = document.getElementById('loading-section');
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');
    const errorSection = document.getElementById('error-section');

    console.log('DEBUG hideLoadingState: loadingSection', loadingSection);
    console.log('DEBUG hideLoadingState: weatherSection', weatherSection);
    console.log('DEBUG hideLoadingState: outfitSection', outfitSection);
    console.log('DEBUG hideLoadingState: errorSection', errorSection);

    if (loadingSection) loadingSection.classList.add('hidden');
    if (weatherSection) weatherSection.classList.add('hidden');
    if (outfitSection) outfitSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function showMainContent() {
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');

    console.log('DEBUG showMainContent: weatherSection', weatherSection);
    console.log('DEBUG showMainContent: outfitSection', outfitSection);

    if (weatherSection) weatherSection.classList.remove('hidden');
    if (outfitSection) outfitSection.classList.remove('hidden');
}

function updateLoadingStep(stepName, status) {
    const stepElement = document.getElementById(`step-${stepName}`);
    if (stepElement) {
        stepElement.className = `step ${status}`;
        appState.steps[stepName] = status === 'completed';
    }
}

// Error handling
function handleAppError(error) {
    console.error('❌ Application error:', error);
    
    hideLoadingState();
    const errorMessageElement = document.getElementById('error-message');
    const errorSectionElement = document.getElementById('error-section');

    if (errorMessageElement) {
        errorMessageElement.textContent = error.message || 'An unexpected error occurred. Please refresh the page and try again.';
    }
    if (errorSectionElement) {
        errorSectionElement.classList.remove('hidden');
    }
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
    if (!appState.isLoading) {
        handleAppError(new Error('A technical error occurred. Please refresh the page.'));
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
    if (!appState.isLoading) {
        handleAppError(new Error('A network error occurred. Please check your connection and try again.'));
    }
});

// Utility function to refresh the app
function refreshApp() {
    console.log('🔄 Refreshing app...');
    location.reload();
}

// Gender selection functionality
function selectGender(gender) {
    console.log('👤 Gender selected:', gender);
    
    // Update app state
    appState.selectedGender = gender;
    
    // Update UI
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-gender="${gender}"]`).classList.add('active');
    
    // Regenerate outfit recommendation if weather data is available
    if (appState.currentWeather) {
        const outfitData = generateOutfitRecommendation(appState.currentWeather, gender);
        appState.outfitPrompt = outfitData.prompt;
        appState.recommendedProducts = outfitData.products;
        updateOutfitUI(outfitData);
        
        // Clear any existing generated images
        const imageContainer = document.getElementById('generated-image-container');
        if (imageContainer) {
            imageContainer.remove();
        }
    }
}

// Update outfit UI to show gender-specific recommendations
function updateOutfitUI(outfitData) {
    const genderText = appState.selectedGender === 'female' ? 'Women\'s' : 'Men\'s';
    
    document.getElementById('outfit-summary').textContent = `${genderText} ${outfitData.summary}`;
    document.getElementById('clothing-items').textContent = outfitData.clothing;
    document.getElementById('footwear').textContent = outfitData.footwear;
    document.getElementById('accessories').textContent = outfitData.accessories;
    document.getElementById('ai-prompt').textContent = outfitData.prompt;
    
    // Update product recommendations
    updateProductRecommendations(outfitData.products || []);
    
    console.log(`✅ ${genderText} Outfit UI updated:`, outfitData);
}

// Update product recommendations display
function updateProductRecommendations(products) {
    console.log('📦 Updating product recommendations UI with:', products);
    
    const productsGrid = document.getElementById('recommended-products');
    
    if (!productsGrid) {
        console.error('❌ Products grid element not found!');
        return;
    }
    
    if (!products || products.length === 0) {
        console.log('⚠️ No products to display');
        // Show test products for debugging
        productsGrid.innerHTML = `
            <div class="product-item">
                <div class="product-image">
                    <img src="https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop" alt="Test Product">
                    <div class="product-overlay">
                        <a href="https://amazon.com" target="_blank" class="view-on-amazon">View on Amazon</a>
                    </div>
                </div>
                <div class="product-info">
                    <h4 class="product-name">Test Product</h4>
                    <p class="product-price">$99.99</p>
                    <span class="product-category">Test Category</span>
                </div>
            </div>
            <p class="no-products">Debug: No product recommendations available - showing test product.</p>
        `;
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="product-item">
            <a href="${product.affiliate}" target="_blank" rel="noopener noreferrer" class="product-link">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    <div class="product-overlay">
                        <span class="view-on-amazon">View on Amazon</span>
                    </div>
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-price">${product.price}</div>
                    <div class="product-category">${product.category}</div>
                </div>
            </a>
        </div>
    `).join('');
    
    productsGrid.innerHTML = productsHTML;
    
    // Add click tracking for analytics
    products.forEach((product, index) => {
        const productLink = productsGrid.children[index].querySelector('.product-link');
        productLink.addEventListener('click', () => {
            console.log('🛍️ Product clicked:', product.name, product.affiliate);
            // Here you could add analytics tracking
        });
    });
}

// Export for global access
window.generateOutfitImage = generateOutfitImage;
window.selectGender = selectGender;
window.refreshApp = refreshApp;
window.displayGeneratedImages = displayGeneratedImages; // Export this as well for testing if needed
window.displayLikedOutfits = displayLikedOutfits; // Export for external use
window.saveLikedOutfit = saveLikedOutfit; // Export for external use (e.g., debugging)
window.getLikedOutfits = getLikedOutfits; // Export for external use (e.g., debugging)
window.deleteLikedOutfit = deleteLikedOutfit; // Export for external use (e.g., debugging)
window.initializeLikedOutfitsPage = initializeLikedOutfitsPage; // Export for liked.html

console.log('🌍 AI Outfit for Today - Script loaded successfully'); 