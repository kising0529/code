// Tomorrow's Outfit Preview Script
// This script extends the main script.js functionality for tomorrow's weather forecast

// Global configuration
const CONFIG = {
    weatherAPI: 'https://api.open-meteo.com/v1/forecast',
    geocodingAPI: 'https://us1.api-bdc.net/data/reverse-geocode-client',
    updateInterval: 300000, // 5 minutes
    locationCacheTime: 3600000 // 1 hour
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

// Tomorrow's Outfit - New Amazon Product Database (Weather-focused items)
const TOMORROW_AMAZON_PRODUCTS = {
    // Women's Weather-Specific Clothing
    female: {
        // Cold Weather Items
        thermal_leggings: {
            name: "Women's Thermal Leggings",
            price: "",
            image: "https://m.media-amazon.com/images/I/51sNOI4MbZL._AC_SY741_.jpg",
            affiliate: "https://amzn.to/3J2i2AT",
            category: "bottoms",
            weather: "cold"
        },
        wool_sweater: {
            name: "Cozy Wool Pullover Sweater",
            price: "",
            image: "https://m.media-amazon.com/images/I/6158NLrE41L._AC_SX679_.jpg",
            affiliate: "https://amzn.to/45mrA1h",
            category: "tops",
            weather: "cold"
        },
        winter_scarf: {
            name: "Warm Knit Scarf",
            price: "",
            image: "https://m.media-amazon.com/images/I/81yczBMTs6L._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4lWjFyF",
            category: "accessories",
            weather: "cold"
        },
        waterproof_boots: {
            name: "Waterproof Winter Boots",
            price: "",
            image: "https://m.media-amazon.com/images/I/61HpOlVpurL._AC_SY695_.jpg",
            affiliate: "https://amzn.to/3J49N7j1",
            category: "shoes",
            weather: "cold"
        },
        
        // Mild Weather Items
        cardigan: {
            name: "Lightweight Cardigan",
            price: "",
            image: "https://m.media-amazon.com/images/I/61Uw4el0ihL._AC_SY741_.jpg",
            affiliate: "https://amzn.to/4la9LZb",
            category: "tops",
            weather: "mild"
        },
        midi_dress: {
            name: "Casual Midi Dress",
            price: "",
            image: "https://m.media-amazon.com/images/I/61w6pYLxjOL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/3HagNz8",
            category: "dresses",
            weather: "mild"
        },
        ballet_flats: {
            name: "Comfortable Ballet Flats",
            price: "",
            image: "https://m.media-amazon.com/images/I/717nSVr785L._AC_SY695_.jpg",
            affiliate: "https://amzn.to/4otOPiH",
            category: "shoes",
            weather: "mild"
        },
        crossbody_bag: {
            name: "Stylish Crossbody Bag",
            price: "",
            image: "https://m.media-amazon.com/images/I/81lk+DTxHWL._AC_SY575_.jpg",
            affiliate: "https://amzn.to/3USe4NL",
            category: "accessories",
            weather: "mild"
        },
        
        // Hot Weather Items
        linen_shorts: {
            name: "Breathable Linen Shorts",
            price: "",
            image: "https://m.media-amazon.com/images/I/61Y2Ak0-viL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4lh9Ee5",
            category: "bottoms",
            weather: "hot"
        },
        tank_top: {
            name: "Cooling Tank Top",
            price: "",
            image: "https://m.media-amazon.com/images/I/81vjlWVG0eL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4oo5ALV",
            category: "tops",
            weather: "hot"
        },
        sun_hat: {
            name: "Wide Brim Sun Hat",
            price: "",
            image: "https://m.media-amazon.com/images/I/7185BtmlTRL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/3J6xj3D",
            category: "accessories",
            weather: "hot"
        },
        sandals_flat: {
            name: "Comfortable Flat Sandals",
            price: "",
            image: "https://m.media-amazon.com/images/I/71drBUt2eIL._AC_SY695_.jpg",
            affiliate: "https://amzn.to/3HlVgmZ",
            category: "shoes",
            weather: "hot"
        },
        
        // Rainy Weather Items
        rain_jacket: {
            name: "Lightweight Rain Jacket",
            price: "",
            image: "https://m.media-amazon.com/images/I/71xB1-7JKaL._AC_SY741_.jpg",
            affiliate: "https://amzn.to/41rEQAn",
            category: "outerwear",
            weather: "rainy"
        },
        waterproof_pants: {
            name: "Waterproof Pants",
            price: "",
            image: "https://m.media-amazon.com/images/I/61dg9EMoeUL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/46Co5pE",
            category: "bottoms",
            weather: "rainy"
        },
        rain_boots: {
            name: "Stylish Rain Boots",
            price: "",
            image: "https://m.media-amazon.com/images/I/51HVn-u2PdL._AC_SY625_.jpg",
            affiliate: "https://amzn.to/4oroCkQ",
            category: "shoes",
            weather: "rainy"
        },
        compact_umbrella: {
            name: "Compact Travel Umbrella",
            price: "",
            image: "https://m.media-amazon.com/images/I/81XEaUA7Q8L._AC_SX679_.jpg",
            affiliate: "https://amzn.to/40PI9RH",
            category: "accessories",
            weather: "rainy"
        }
    },
    
    // Men's Weather-Specific Clothing
    male: {
        // Cold Weather Items
        thermal_underwear: {
            name: "Men's Thermal Underwear Set",
            price: "",
            image: "https://m.media-amazon.com/images/I/51qMowmobXL._AC_SY741_.jpg",
            affiliate: "https://amzn.to/4fmQXVb",
            category: "underwear",
            weather: "cold"
        },
        fleece_hoodie: {
            name: "Warm Fleece Hoodie",
            price: "",
            image: "https://m.media-amazon.com/images/I/71cxQHoAN4L._AC_SX679_.jpg",
            affiliate: "https://amzn.to/3UhhXM9",
            category: "tops",
            weather: "cold"
        },
        winter_gloves: {
            name: "Insulated Winter Gloves",
            price: "",
            image: "https://m.media-amazon.com/images/I/71JW3D3EKcL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4m83vT4",
            category: "accessories",
            weather: "cold"
        },
        winter_boots: {
            name: "Men's Winter Boots",
            price: "",
            image: "https://m.media-amazon.com/images/I/61AeOQjhmCL._AC_SY625_.jpg",
            affiliate: "hhttps://amzn.to/4odDm6y",
            category: "shoes",
            weather: "cold"
        },
        
        // Mild Weather Items
        henley_shirt: {
            name: "Long Sleeve Henley",
            price: "",
            image: "https://m.media-amazon.com/images/I/61HENLEY123._AC_SX569_.jpg",
            affiliate: "https://amzn.to/3mhenley1",
            category: "tops",
            weather: "mild"
        },
        khaki_pants: {
            name: "Casual Khaki Pants",
            price: "",
            image: "https://m.media-amazon.com/images/I/71De-IPZoeL._AC_SX679_.jpg",
            affiliate: "hhttps://amzn.to/4lYHQMN",
            category: "bottoms",
            weather: "mild"
        },
        canvas_shoes: {
            name: "Canvas Casual Shoes",
            price: "",
            image: "https://m.media-amazon.com/images/I/712xIk9k2PL._AC_SY625_.jpg",
            affiliate: "https://amzn.to/4msGb20",
            category: "shoes",
            weather: "mild"
        },
        leather_belt: {
            name: "Genuine Leather Belt",
            price: "",
            image: "https://m.media-amazon.com/images/I/71V9mpDQONL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/3JkCzAH",
            category: "accessories",
            weather: "mild"
        },
        
        // Hot Weather Items
        linen_shirt: {
            name: "Breathable Linen Shirt",
            price: "",
            image: "https://m.media-amazon.com/images/I/613DJyFfdcL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/3HguZGP",
            category: "tops",
            weather: "hot"
        },
        cargo_shorts: {
            name: "Lightweight Cargo Shorts",
            price: "",
            image: "https://m.media-amazon.com/images/I/714BcT27hnL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/3HjfHAY",
            category: "bottoms",
            weather: "hot"
        },
        baseball_cap: {
            name: "UV Protection Baseball Cap",
            price: "",
            image: "https://m.media-amazon.com/images/I/314WTWs3gCL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4ondntq",
            category: "accessories",
            weather: "hot"
        },
        flip_flops: {
            name: "Comfortable Flip Flops",
            price: "",
            image: "https://m.media-amazon.com/images/I/61kO827hSxL._AC_SY575_.jpg",
            affiliate: "https://amzn.to/3USvlX7",
            category: "shoes",
            weather: "hot"
        },
        
        // Rainy Weather Items
        rain_coat: {
            name: "Men's Waterproof Rain Coat",
            price: "",
            image: "https://m.media-amazon.com/images/I/612QMi-X95S._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4m2l5Yv",
            category: "outerwear",
            weather: "rainy"
        },
        waterproof_jeans: {
            name: "Water-Resistant Jeans",
            price: "",
            image: "https://m.media-amazon.com/images/I/612bONbAh+L._AC_SY879_.jpg",
            affiliate: "https://amzn.to/3JiWoZ7",
            category: "bottoms",
            weather: "rainy"
        },
        rubber_boots: {
            name: "Waterproof Rubber Boots",
            price: "",
            image: "https://m.media-amazon.com/images/I/51LS0J-u1kL._AC_SY625_.jpg",
            affiliate: "Waterproof Rubber Boots",
            category: "shoes",
            weather: "rainy"
        },
        travel_umbrella: {
            name: "Heavy Duty Travel Umbrella",
            price: "$18.99",
            image: "https://m.media-amazon.com/images/I/71eFkF8OrpL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/40NUGFh",
            category: "accessories",
            weather: "rainy"
        }
    }
};

// Original Amazon Affiliate Product Database (kept for reference)
const AMAZON_PRODUCTS = {
    // Women's Clothing
    female: {
        winter_coat: {
            name: "Women's Winter Puffer Coat",
            price: "",
            image: "https://m.media-amazon.com/images/I/61FUZ-xv35L._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4on02Bw",
            category: "outerwear"
        },
        spring_jacket: {
            name: "Lightweight Spring Jacket",
            price: "",
            image: "https://m.media-amazon.com/images/I/61mTe1kuWdL._AC_SX466_.jpg",
            affiliate: "https://amzn.to/4fqmqG3",
            category: "outerwear"
        },
        summer_blouse: {
            name: "Flowy Summer Blouse",
            price: "",
            image: "https://m.media-amazon.com/images/I/71gYKEETzAL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4mnuR77",
            category: "tops"
        },
        jeans: {
            name: "High-Waisted Skinny Jeans",
            price: "",
            image: "https://m.media-amazon.com/images/I/51u9zd4tMuL._AC_SX466_.jpg",
            affiliate: "https://amzn.to/41pWwME",
            category: "bottoms"
        },
        ankle_boots: {
            name: "Stylish Ankle Boots",
            price: "",
            image: "https://m.media-amazon.com/images/I/71jz1gFIw8L._AC_SY500_.jpg",
            affiliate: "https://amzn.to/4fq524c",
            category: "shoes"
        },
        sandals: {
            name: "Comfortable Summer Sandals",
            price: "",
            image: "https://m.media-amazon.com/images/I/71+mXAInehL._AC_SX500_.jpg",
            affiliate: "https://amzn.to/3UcL5nG",
            category: "shoes"
        },
        umbrella: {
            name: "Compact Travel Umbrella",
            price: "",
            image: "https://m.media-amazon.com/images/I/71zIdlkvCYL._AC_SY606_.jpg",
            affiliate: "https://amzn.to/3H7qXR5",
            category: "accessories"
        },
        sunglasses: {
            name: "Trendy Sunglasses",
            price: "",
            image: "https://m.media-amazon.com/images/I/61OWQuAXOmL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4ldLkd8",
            category: "accessories"
        }
    },
    // Men's Clothing
    male: {
        winter_jacket: {
            name: "Men's Winter Parka",
            price: "",
            image: "https://m.media-amazon.com/images/I/71bUNRWp1EL._AC_SX522_.jpg",
            affiliate: "https://amzn.to/3J0uuRC",
            category: "outerwear"
        },
        casual_jacket: {
            name: "Casual Spring Jacket",
            price: "",
            image: "https://m.media-amazon.com/images/I/61-Zj9GaFnL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/41mdpI8",
            category: "outerwear"
        },
        polo_shirt: {
            name: "Classic Polo Shirt",
            price: "",
            image: "https://m.media-amazon.com/images/I/81LUX6h9NVL._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4fkqbN4",
            category: "tops"
        },
        chinos: {
            name: "Slim Fit Chino Pants",
            price: "",
            image: "https://m.media-amazon.com/images/I/612D6TEIEoL._AC_SY741_.jpg",
            affiliate: "https://amzn.to/3ULfucY",
            category: "bottoms"
        },
        sneakers: {
            name: "Casual Sneakers",
            price: "",
            image: "https://m.media-amazon.com/images/I/711lA5rk08L._AC_SY625_.jpg",
            affiliate: "https://amzn.to/3J0sY23",
            category: "shoes"
        },
        boat_shoes: {
            name: "Classic Boat Shoes",
            price: "",
            image: "https://m.media-amazon.com/images/I/51RtzZIlnoL._AC_SY625_.jpg",
            affiliate: "https://amzn.to/3HfitHB",
            category: "shoes"
        },
        cap: {
            name: "Baseball Cap",
            price: "",
            image: "https://m.media-amazon.com/images/I/712CSDnz+mL._AC_SX679_.jpg",
            affiliate: "https://amzn.to/4ojKBKg",
            category: "accessories"
        },
        sunglasses: {
            name: "Classic Aviator Sunglasses",
            price: "",
            image: "https://m.media-amazon.com/images/I/61Rvz5ust9L._AC_SX569_.jpg",
            affiliate: "https://amzn.to/4fmwRdN",
            category: "accessories"
        }
    }
};

// Tomorrow-specific translations
const tomorrowTranslations = {
    en: {
        "tomorrow.title": "🌅 Tomorrow's Outfit Preview",
        "tomorrow.subtitle": "Get ready for tomorrow with AI-powered fashion forecast",
        

        "tomorrow.loading.title": "Analyzing Tomorrow's Weather...",
        "tomorrow.loading.text": "Preparing your fashion forecast for tomorrow",
        "tomorrow.loading.steps.weather": "Fetching tomorrow's weather",
        "tomorrow.loading.steps.outfit": "Generating tomorrow's outfit",
        "tomorrow.loading.steps.image": "Creating fashion preview",
        "tomorrow.weather.title": "Tomorrow's Weather Forecast",
        "tomorrow.weather.dateLoading": "📅 Loading date...",
        "tomorrow.outfit.title": "Perfect Outfit for Tomorrow",
        "tomorrow.outfit.aiRecommended": "AI Fashion Forecast",
        "tomorrow.outfit.analyzing": "Analyzing tomorrow's weather conditions to recommend the perfect outfit...",
        "tomorrow.outfit.generateImage": "Generate Tomorrow's Outfit Image",
        "tomorrow.outfit.generateNote": "AI will create outfit images based on tomorrow's weather forecast",


        "tomorrow.howItWorks.title": "How Tomorrow's Forecast Works",
        "tomorrow.howItWorks.steps.location.title": "Auto Location",
        "tomorrow.howItWorks.steps.location.description": "We detect your location to get accurate tomorrow's weather forecast",
        "tomorrow.howItWorks.steps.weather.title": "Tomorrow's Weather",
        "tomorrow.howItWorks.steps.weather.description": "Advanced weather prediction for tomorrow's conditions and temperature",
        "tomorrow.howItWorks.steps.ai.title": "AI Fashion Forecast",
        "tomorrow.howItWorks.steps.ai.description": "Smart algorithms predict the perfect outfit for tomorrow's weather",
        "tomorrow.howItWorks.steps.visual.title": "Visual Preview",
        "tomorrow.howItWorks.steps.visual.description": "Generate stunning AI images of tomorrow's recommended outfit",
        "tomorrow.error.message": "Please enable location access and refresh the page to get tomorrow's weather-based outfit recommendations.",
        "tomorrow.footer.brandName": "Tomorrow's AI Outfit",
        "tomorrow.footer.brandSlogan": "Fashion forecast for tomorrow's weather worldwide",
        "tomorrow.footer.copy": "© 2024 Tomorrow's AI Outfit. Fashion forecast powered by Open-Meteo API."
    },
    ko: {
        "tomorrow.title": "🌅 내일의 코디 미리보기",
        "tomorrow.subtitle": "AI 기반 패션 예보로 내일을 준비하세요",
        

        "tomorrow.loading.title": "내일의 날씨 분석 중...",
        "tomorrow.loading.text": "내일을 위한 패션 예보를 준비하고 있습니다",
        "tomorrow.loading.steps.weather": "내일의 날씨 가져오는 중",
        "tomorrow.loading.steps.outfit": "내일의 코디 생성 중",
        "tomorrow.loading.steps.image": "패션 미리보기 생성 중",
        "tomorrow.weather.title": "내일의 날씨 예보",
        "tomorrow.weather.dateLoading": "📅 날짜 로딩 중...",
        "tomorrow.outfit.title": "내일을 위한 완벽한 코디",
        "tomorrow.outfit.aiRecommended": "AI 패션 예보",
        "tomorrow.outfit.analyzing": "내일의 날씨 조건을 분석하여 완벽한 코디를 추천하고 있습니다...",
        "tomorrow.outfit.generateImage": "내일의 코디 이미지 생성",
        "tomorrow.outfit.generateNote": "AI가 내일의 날씨 예보를 바탕으로 코디 이미지를 생성합니다",


        "tomorrow.howItWorks.title": "내일의 예보 작동 방식",
        "tomorrow.howItWorks.steps.location.title": "자동 위치",
        "tomorrow.howItWorks.steps.location.description": "정확한 내일의 날씨 예보를 위해 귀하의 위치를 감지합니다",
        "tomorrow.howItWorks.steps.weather.title": "내일의 날씨",
        "tomorrow.howItWorks.steps.weather.description": "내일의 날씨 조건과 온도에 대한 고급 날씨 예측",
        "tomorrow.howItWorks.steps.ai.title": "AI 패션 예보",
        "tomorrow.howItWorks.steps.ai.description": "스마트 알고리즘이 내일의 날씨에 완벽한 코디를 예측합니다",
        "tomorrow.howItWorks.steps.visual.title": "시각적 미리보기",
        "tomorrow.howItWorks.steps.visual.description": "내일의 추천 코디의 멋진 AI 이미지를 생성합니다",
        "tomorrow.error.message": "위치 액세스를 활성화하고 페이지를 새로고침하여 내일의 날씨 기반 코디 추천을 받으세요.",
        "tomorrow.footer.brandName": "내일의 AI 코디",
        "tomorrow.footer.brandSlogan": "전 세계 내일의 날씨를 위한 패션 예보",
        "tomorrow.footer.copy": "© 2024 내일의 AI 코디. Open-Meteo API로 구동되는 패션 예보."
    },
    ja: {
        "tomorrow.title": "🌅 明日のコーデ プレビュー",
        "tomorrow.subtitle": "AI搭載ファッション予報で明日の準備をしましょう",
        

        "tomorrow.loading.title": "明日の天気を分析中...",
        "tomorrow.loading.text": "明日のファッション予報を準備しています",
        "tomorrow.loading.steps.weather": "明日の天気を取得中",
        "tomorrow.loading.steps.outfit": "明日のコーデを生成中",
        "tomorrow.loading.steps.image": "ファッションプレビューを作成中",
        "tomorrow.weather.title": "明日の天気予報",
        "tomorrow.weather.dateLoading": "📅 日付を読み込み中...",
        "tomorrow.outfit.title": "明日のための完璧なコーデ",
        "tomorrow.outfit.aiRecommended": "AIファッション予報",
        "tomorrow.outfit.analyzing": "明日の天気条件を分析して完璧なコーデを推薦しています...",
        "tomorrow.outfit.generateImage": "明日のコーデ画像を生成",
        "tomorrow.outfit.generateNote": "AIが明日の天気予報に基づいてコーデ画像を作成します",


        "tomorrow.howItWorks.title": "明日の予報の仕組み",
        "tomorrow.howItWorks.steps.location.title": "自動位置情報",
        "tomorrow.howItWorks.steps.location.description": "正確な明日の天気予報を得るために位置情報を検出します",
        "tomorrow.howItWorks.steps.weather.title": "明日の天気",
        "tomorrow.howItWorks.steps.weather.description": "明日の天気条件と気温の高度な天気予測",
        "tomorrow.howItWorks.steps.ai.title": "AIファッション予報",
        "tomorrow.howItWorks.steps.ai.description": "スマートアルゴリズムが明日の天気に完璧なコーデを予測します",
        "tomorrow.howItWorks.steps.visual.title": "ビジュアルプレビュー",
        "tomorrow.howItWorks.steps.visual.description": "明日の推奨コーデの素晴らしいAI画像を生成します",
        "tomorrow.error.message": "位置情報アクセスを有効にしてページを更新し、明日の天気ベースのコーデ推奨を受け取ってください。",
        "tomorrow.footer.brandName": "明日のAIコーデ",
        "tomorrow.footer.brandSlogan": "世界中の明日の天気のためのファッション予報",
        "tomorrow.footer.copy": "© 2024 明日のAIコーデ. Open-Meteo APIによるファッション予報."
    },
    zh: {
        "tomorrow.title": "🌅 明日穿搭预览",
        "tomorrow.subtitle": "用AI驱动的时尚预报为明天做准备",
        

        "tomorrow.loading.title": "正在分析明天的天气...",
        "tomorrow.loading.text": "正在为您准备明天的时尚预报",
        "tomorrow.loading.steps.weather": "正在获取明天的天气",
        "tomorrow.loading.steps.outfit": "正在生成明天的穿搭",
        "tomorrow.loading.steps.image": "正在创建时尚预览",
        "tomorrow.weather.title": "明天的天气预报",
        "tomorrow.weather.dateLoading": "📅 正在加载日期...",
        "tomorrow.outfit.title": "明天的完美穿搭",
        "tomorrow.outfit.aiRecommended": "AI时尚预报",
        "tomorrow.outfit.analyzing": "正在分析明天的天气条件以推荐完美的穿搭...",
        "tomorrow.outfit.generateImage": "生成明天的穿搭图片",
        "tomorrow.outfit.generateNote": "AI将根据明天的天气预报创建穿搭图片",


        "tomorrow.howItWorks.title": "明天预报的工作原理",
        "tomorrow.howItWorks.steps.location.title": "自动定位",
        "tomorrow.howItWorks.steps.location.description": "我们检测您的位置以获得准确的明天天气预报",
        "tomorrow.howItWorks.steps.weather.title": "明天的天气",
        "tomorrow.howItWorks.steps.weather.description": "明天天气条件和温度的高级天气预测",
        "tomorrow.howItWorks.steps.ai.title": "AI时尚预报",
        "tomorrow.howItWorks.steps.ai.description": "智能算法预测明天天气的完美穿搭",
        "tomorrow.howItWorks.steps.visual.title": "视觉预览",
        "tomorrow.howItWorks.steps.visual.description": "生成明天推荐穿搭的精美AI图片",
        "tomorrow.error.message": "请启用位置访问并刷新页面以获取基于明天天气的穿搭推荐。",
        "tomorrow.footer.brandName": "明日AI穿搭",
        "tomorrow.footer.brandSlogan": "全球明天天气的时尚预报",
        "tomorrow.footer.copy": "© 2024 明日AI穿搭. 由Open-Meteo API提供的时尚预报."
    }
};

// Tomorrow-specific app state
let tomorrowAppState = {
    currentWeather: null,
    currentLocation: null,
    outfitPrompt: '',
    selectedGender: 'female',
    selectedStyle: 'casual',
    recommendedProducts: [],
    isLoading: false,
    steps: {
        location: false,
        weather: false,
        outfit: false,
        image: false
    }
};

// Apply tomorrow's translations
function applyTomorrowTranslations(language = 'en') {
    const translations = tomorrowTranslations[language] || tomorrowTranslations.en;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
    
    // Update language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = language;
    }
    
    console.log(`🌍 Applied tomorrow translations for: ${language}`);
}

// Initialize tomorrow's outfit preview app
async function initializeTomorrowApp() {
    console.log('🌅 Tomorrow\'s Outfit Preview - Initializing...');
    
    // Initialize language
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    applyTomorrowTranslations(savedLanguage);
    
    // Initialize language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const newLanguage = e.target.value;
            localStorage.setItem('selectedLanguage', newLanguage);
            applyTomorrowTranslations(newLanguage);
        });
    }
    
    // Initialize gender and style selection
    initializeTomorrowPreferences();

    try {
        tomorrowAppState.isLoading = true;
        showLoadingState();

        // Initialize IndexedDB
        if (typeof openIndexedDB === 'function') {
            await openIndexedDB();
        }
        
        // Step 1: Get user location
        updateLoadingStep('location', 'active');
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        tomorrowAppState.currentLocation = { latitude, longitude };
        updateLoadingStep('location', 'completed');
        
        // Step 2: Fetch tomorrow's weather data
        updateLoadingStep('weather', 'active');
        const weatherData = await fetchTomorrowWeatherData(latitude, longitude);
        tomorrowAppState.currentWeather = weatherData;
        updateLoadingStep('weather', 'completed');
        
        // Step 3: Generate outfit recommendation for tomorrow
        updateLoadingStep('outfit', 'active');
        console.log('🔄 Generating tomorrow outfit recommendation...');
        console.log('📊 Weather data for outfit:', weatherData);
        console.log('👤 Gender/Style:', tomorrowAppState.selectedGender, tomorrowAppState.selectedStyle);
        
        const outfitData = generateTomorrowOutfitRecommendation(weatherData, tomorrowAppState.selectedGender, tomorrowAppState.selectedStyle);
        console.log('📝 Generated outfit data:', outfitData);
        
        tomorrowAppState.outfitPrompt = outfitData.prompt;
        tomorrowAppState.recommendedProducts = outfitData.products;
        console.log('✅ Tomorrow outfit prompt set:', tomorrowAppState.outfitPrompt ? 'Yes' : 'No');
        console.log('📏 Prompt length:', tomorrowAppState.outfitPrompt ? tomorrowAppState.outfitPrompt.length : 0);
        updateLoadingStep('outfit', 'completed');
        
        // Step 4: Prepare image generation
        updateLoadingStep('image', 'active');
        await new Promise(resolve => setTimeout(resolve, 500));
        updateLoadingStep('image', 'completed');
        
        // Get location name for display
        const locationName = await getLocationName(latitude, longitude);
        
        // Update UI with all data
        await updateTomorrowWeatherUI(weatherData, locationName);
        updateTomorrowOutfitUI(outfitData);
        
        // Show main content
        hideLoadingState();
        showMainContent();
        
        tomorrowAppState.isLoading = false;
        console.log('✅ Tomorrow\'s app initialized successfully');
        
    } catch (error) {
        console.error('❌ Tomorrow\'s app initialization failed:', error);
        handleAppError(error);
        tomorrowAppState.isLoading = false;
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

// Get location name using reverse geocoding
async function getLocationName(latitude, longitude) {
    try {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            localityLanguage: currentLang // Request location name in current language
        });
        
        const url = `${CONFIG.geocodingAPI}?${params}`;
        console.log('📍 Fetching location name from BigDataCloud:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`BigDataCloud Geocoding API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ BigDataCloud Geocoding data received:', data);
        
        if (data.city) {
            return data.city; // Prefer city name
        } else if (data.principalSubdivision) {
            return data.principalSubdivision; // Fallback to subdivision (e.g., province/state)
        } else if (data.countryName) {
            return data.countryName; // Fallback to country name
        } else {
            return 'Your Location';
        }
    } catch (error) {
        console.warn('⚠️ Could not get accurate location name from BigDataCloud:', error);
        return 'Your Location';
    }
}

// Fetch tomorrow's weather data
async function fetchTomorrowWeatherData(latitude, longitude) {
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
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,apparent_temperature_max,apparent_temperature_min',
        timezone: 'auto',
        forecast_days: 2 // Get today and tomorrow
    });
    
    const url = `${CONFIG.weatherAPI}?${params}`;
    console.log('🌡️ Fetching tomorrow\'s weather data from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Tomorrow\'s weather data received:', data);
    
    // Extract tomorrow's data (index 1)
    const tomorrowData = {
        temperature_2m: data.daily.temperature_2m_max[1], // Tomorrow's max temp
        apparent_temperature: data.daily.apparent_temperature_max[1], // Tomorrow's feels like
        relative_humidity_2m: 65, // Estimated humidity for tomorrow
        weather_code: data.daily.weather_code[1], // Tomorrow's weather code
        wind_speed_10m: 10 // Estimated wind speed
    };
    
    return {
        current: tomorrowData,
        daily: data.daily,
        timezone: data.timezone,
        location: { latitude, longitude },
        isTomorrow: true
    };
}

// Generate tomorrow-specific weather-focused product recommendations
function generateTomorrowProductRecommendations(temp, weatherCode, gender, style) {
    console.log('🛍️ Generating tomorrow\'s weather-focused products for:', { temp, weatherCode, gender, style });
    
    const products = [];
    const genderProducts = TOMORROW_AMAZON_PRODUCTS[gender];
    
    if (!genderProducts) {
        console.error('❌ No products found for gender:', gender);
        return [];
    }
    
    console.log('✅ Available weather products for', gender, ':', Object.keys(genderProducts));
    
    // Determine weather category based on temperature and weather code
    let weatherCategory = 'mild';
    
    if (temp <= 5) {
        weatherCategory = 'cold';
    } else if (temp >= 25) {
        weatherCategory = 'hot';
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
        weatherCategory = 'rainy';
    }
    
    console.log('🌡️ Weather category determined:', weatherCategory, 'for temp:', temp, 'weatherCode:', weatherCode);
    
    // Get products matching the weather category
    const weatherProducts = Object.values(genderProducts).filter(product => 
        product.weather === weatherCategory
    );
    
    console.log('🎯 Found', weatherProducts.length, 'products for', weatherCategory, 'weather');
    
    // Select 4 products prioritizing different categories
    const categories = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'dresses', 'underwear'];
    const selectedProducts = [];
    
    // First, try to get one product from each major category
    for (const category of categories) {
        if (selectedProducts.length >= 4) break;
        
        const categoryProduct = weatherProducts.find(product => 
            product.category === category && 
            !selectedProducts.includes(product)
        );
        
        if (categoryProduct) {
            selectedProducts.push(categoryProduct);
            console.log('✅ Added', categoryProduct.name, 'from category:', category);
        }
    }
    
    // Fill remaining slots with any available products
    while (selectedProducts.length < 4 && selectedProducts.length < weatherProducts.length) {
        const remainingProducts = weatherProducts.filter(product => 
            !selectedProducts.includes(product)
        );
        
        if (remainingProducts.length === 0) break;
        
        const randomProduct = remainingProducts[Math.floor(Math.random() * remainingProducts.length)];
        selectedProducts.push(randomProduct);
        console.log('✅ Added additional product:', randomProduct.name);
    }
    
    // Special weather-specific additions
    if (weatherCategory === 'rainy') {
        // Always prioritize umbrella for rainy weather
        const umbrella = Object.values(genderProducts).find(product => 
            product.name.toLowerCase().includes('umbrella')
        );
        if (umbrella && !selectedProducts.includes(umbrella)) {
            if (selectedProducts.length >= 4) {
                selectedProducts[selectedProducts.length - 1] = umbrella; // Replace last item
            } else {
                selectedProducts.push(umbrella);
            }
            console.log('☔ Prioritized umbrella for rainy weather');
        }
    }
    
    if (weatherCategory === 'hot' && [0, 1].includes(weatherCode)) {
        // Prioritize sun protection for sunny hot weather
        const sunProtection = Object.values(genderProducts).find(product => 
            product.name.toLowerCase().includes('hat') || 
            product.name.toLowerCase().includes('cap')
        );
        if (sunProtection && !selectedProducts.includes(sunProtection)) {
            if (selectedProducts.length >= 4) {
                selectedProducts[selectedProducts.length - 1] = sunProtection;
            } else {
                selectedProducts.push(sunProtection);
            }
            console.log('☀️ Prioritized sun protection for hot sunny weather');
        }
    }
    
    console.log('🎯 Final tomorrow weather products:', selectedProducts.length, selectedProducts.map(p => `${p.name} (${p.weather})`));
    
    return selectedProducts.slice(0, 4);
}

// Generate outfit recommendation for tomorrow
function generateTomorrowOutfitRecommendation(weatherData, gender = tomorrowAppState.selectedGender, style = tomorrowAppState.selectedStyle) {
    console.log('🔄 generateTomorrowOutfitRecommendation called with:', { weatherData, gender, style });
    console.log('🔍 generateOutfitRecommendation function exists:', typeof generateOutfitRecommendation === 'function');
    
    // Use the existing generateOutfitRecommendation function with tomorrow's weather data
    if (typeof generateOutfitRecommendation === 'function') {
        console.log('✅ Using existing generateOutfitRecommendation function');
        const outfitData = generateOutfitRecommendation(weatherData, gender, style);
        console.log('📝 Base outfit data generated:', outfitData);
        
        // Modify the prompt to indicate it's for tomorrow
        const tomorrowPrompt = outfitData.prompt.replace(
            'for a fashion photoshoot',
            'for tomorrow\'s fashion forecast, fashion photoshoot'
        );
        
        // Modify the summary to indicate it's for tomorrow
        const tomorrowSummary = outfitData.summary.replace(
            'Perfect for',
            'Perfect for tomorrow\'s'
        );
        
        // Use tomorrow-specific products instead of main page products
        const tomorrowProducts = generateTomorrowProductRecommendations(
            weatherData.current.temperature_2m,
            weatherData.current.weather_code,
            gender,
            style
        );
        
        const result = {
            ...outfitData,
            prompt: tomorrowPrompt,
            summary: tomorrowSummary,
            products: tomorrowProducts // Use tomorrow-specific products
        };
        
        console.log('✅ Tomorrow outfit data prepared:', result);
        return result;
    }
    
    // Fallback if function doesn't exist
    console.log('⚠️ Using fallback outfit generation');
    const temp = weatherData.current.temperature_2m || 20;
    const weatherCondition = weatherData.current.weather_code || 1;
    const genderText = gender === 'female' ? 'stylish woman' : 'handsome man';
    
    const fallbackResult = {
        prompt: `A ${genderText} modeling tomorrow's fashionable ${style} outfit for ${temp}°C weather, professional fashion photography, person clearly visible, full body shot showing complete outfit, realistic human proportions`,
        summary: `Perfect outfit for tomorrow's ${temp}°C weather. Ideal for ${style} occasions with weather-appropriate styling.`,
        clothing: 'Weather-appropriate clothing',
        footwear: 'Comfortable shoes',
        accessories: 'Weather-suitable accessories',
        style: `Tomorrow's ${style} fashion`,
        temperature: temp,
        weatherCondition: 'Tomorrow\'s weather',
        products: generateTomorrowProductRecommendations(temp, weatherCondition, gender, style)
    };
    
    console.log('✅ Fallback outfit data created:', fallbackResult);
    return fallbackResult;
}

// Update tomorrow's weather UI
async function updateTomorrowWeatherUI(weatherData, locationName) {
    const current = weatherData.current;
    const weather = WEATHER_CODES[current.weather_code] || WEATHER_CODES[1];
    
    // Update weather display
    const weatherIconElement = document.getElementById('weather-icon');
    const temperatureElement = document.getElementById('temperature');
    const weatherConditionElement = document.getElementById('weather-condition');
    const feelsLikeElement = document.getElementById('feels-like');
    const humidityElement = document.getElementById('humidity');
    const locationNameElement = document.getElementById('location-name');
    const tomorrowDateElement = document.getElementById('tomorrow-date');

    if (weatherIconElement) weatherIconElement.textContent = weather.icon;
    if (temperatureElement) temperatureElement.textContent = `${Math.round(current.temperature_2m)}°C`;
    if (weatherConditionElement) weatherConditionElement.textContent = weather.condition;
    if (feelsLikeElement) feelsLikeElement.textContent = `Feels like ${Math.round(current.apparent_temperature)}°C`;
    if (humidityElement) humidityElement.textContent = `Humidity ${current.relative_humidity_2m}%`;
    if (locationNameElement) locationNameElement.textContent = `📍 ${locationName}`;
    
    // Update tomorrow's date
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toLocaleDateString([], { 
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
        if (tomorrowDateElement) tomorrowDateElement.textContent = `📅 ${dateString}`;
    } catch (error) {
        if (tomorrowDateElement) tomorrowDateElement.textContent = '📅 Tomorrow';
    }
}

// Update tomorrow's outfit UI
function updateTomorrowOutfitUI(outfitData) {
    // Update outfit summary
    const outfitSummaryElement = document.getElementById('outfit-summary');
    if (outfitSummaryElement) {
        outfitSummaryElement.textContent = outfitData.summary;
    }

    // Update outfit details
    const clothingItemsElement = document.getElementById('clothing-items');
    const footwearElement = document.getElementById('footwear');
    const accessoriesElement = document.getElementById('accessories');
    const outfitStyleElement = document.getElementById('outfit-style-display');

    if (clothingItemsElement) clothingItemsElement.textContent = outfitData.clothing;
    if (footwearElement) footwearElement.textContent = outfitData.footwear;
    if (accessoriesElement) accessoriesElement.textContent = outfitData.accessories;
    if (outfitStyleElement) outfitStyleElement.textContent = outfitData.style;

    // Update AI prompt (but keep it hidden)
    const aiPromptElement = document.getElementById('ai-prompt');
    if (aiPromptElement) {
        aiPromptElement.textContent = outfitData.prompt;
        aiPromptElement.classList.add('hidden');
    }

    // Update product recommendations
    updateTomorrowProductRecommendations(outfitData.products);
}

// Update tomorrow's product recommendations
function updateTomorrowProductRecommendations(products) {
    const productsContainer = document.getElementById('recommended-products');
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products" data-i18n="products.noProducts">No product recommendations available for tomorrow.</p>';
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
                    <p class="product-price">${product.price || 'Check Price'}</p>
                    <p class="product-category">${product.category}</p>
                </div>
            </a>
        </div>
    `).join('');

    productsContainer.innerHTML = productsHTML;
}

// Initialize tomorrow's preferences (gender and style selection)
function initializeTomorrowPreferences() {
    // Gender selection
    const genderButtons = document.querySelectorAll('.gender-btn');
    genderButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gender = button.dataset.gender;
            updateTomorrowPreferences('gender', gender);
        });
    });

    // Style selection
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const style = button.dataset.style;
            updateTomorrowPreferences('style', style);
        });
    });
}

// Update tomorrow's preferences
function updateTomorrowPreferences(type, value) {
    console.log(`Updating tomorrow's preference: ${type} to ${value}`);

    if (type === 'gender') {
        tomorrowAppState.selectedGender = value;
        // Update UI for gender buttons
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-gender="${value}"]`).classList.add('active');
    } else if (type === 'style') {
        tomorrowAppState.selectedStyle = value;
        // Update UI for style buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-style="${value}"]`).classList.add('active');
    }

    // Regenerate outfit recommendation if weather data is available
    if (tomorrowAppState.currentWeather) {
        try {
            const outfitData = generateTomorrowOutfitRecommendation(
                tomorrowAppState.currentWeather, 
                tomorrowAppState.selectedGender, 
                tomorrowAppState.selectedStyle
            );
            tomorrowAppState.outfitPrompt = outfitData.prompt;
            tomorrowAppState.recommendedProducts = outfitData.products;
            console.log('🔄 Updated tomorrow outfit prompt:', tomorrowAppState.outfitPrompt ? 'Yes' : 'No');
            updateTomorrowOutfitUI(outfitData);
        } catch (error) {
            console.error('Error updating tomorrow\'s outfit recommendation:', error);
        }
    }
}

// Generate tomorrow's outfit image
async function generateTomorrowOutfitImage() {
    console.log('🎨 generateTomorrowOutfitImage called');
    console.log('👤 Selected gender:', tomorrowAppState.selectedGender);
    console.log('👗 Selected style:', tomorrowAppState.selectedStyle);
    
    // Get current selections
    const gender = tomorrowAppState.selectedGender || 'female';
    const style = tomorrowAppState.selectedStyle || 'casual';
    
    // Create detailed, style-specific prompts
    let tomorrowPrompt = '';
    
    if (gender === 'female') {
        switch (style) {
            case 'business':
                tomorrowPrompt = 'A professional businesswoman modeling tomorrow\'s sophisticated business outfit, wearing elegant blazer and tailored pants or pencil skirt, professional heels, minimal jewelry, confident pose, modern office background, professional fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
            case 'date':
                tomorrowPrompt = 'A stylish woman modeling tomorrow\'s romantic date outfit, wearing elegant dress or chic blouse with fashionable pants, stylish heels or elegant flats, beautiful accessories, charming smile, romantic setting background, fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
            case 'casual':
            default:
                tomorrowPrompt = 'A fashionable woman modeling tomorrow\'s casual everyday outfit, wearing comfortable yet stylish clothing like trendy top and jeans or casual dress, comfortable sneakers or casual shoes, relaxed accessories, natural pose, urban casual background, lifestyle fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
        }
    } else {
        switch (style) {
            case 'business':
                tomorrowPrompt = 'A professional businessman modeling tomorrow\'s sharp business outfit, wearing tailored suit or dress shirt with chinos, leather dress shoes, professional accessories, confident stance, modern office background, professional fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
            case 'date':
                tomorrowPrompt = 'A handsome man modeling tomorrow\'s stylish date outfit, wearing smart casual blazer or nice shirt with dark jeans or chinos, stylish shoes, fashionable accessories, charming pose, romantic setting background, fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
            case 'casual':
            default:
                tomorrowPrompt = 'A stylish man modeling tomorrow\'s casual everyday outfit, wearing comfortable yet fashionable clothing like polo shirt or casual shirt with jeans or chinos, casual sneakers or loafers, relaxed accessories, natural pose, urban casual background, lifestyle fashion photography, full body shot, realistic human proportions, detailed clothing textures';
                break;
        }
    }
    
    console.log('✅ Created detailed tomorrow prompt:', tomorrowPrompt);
    
    // Set the prompt in state for the image generation process
    tomorrowAppState.outfitPrompt = tomorrowPrompt;
    
    // Ensure prompt elements remain hidden
    const aiPromptElement = document.getElementById('ai-prompt');
    const promptPreviewElement = document.querySelector('.prompt-preview');

    if (aiPromptElement) {
        aiPromptElement.classList.add('hidden');
    }
    if (promptPreviewElement) {
        promptPreviewElement.style.display = 'none';
        promptPreviewElement.classList.add('hidden');
    }

    console.log('🎨 Generating tomorrow\'s AI outfit image with prompt:', tomorrowAppState.outfitPrompt);
    
    // Show loading state
    const generateBtn = document.getElementById('generate-image-btn');
    if (!generateBtn) {
        console.error('❌ Generate button not found!');
        alert('Button not found. Please refresh the page.');
        return;
    }
    
    const originalContent = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generating Tomorrow\'s Image...</span>';
    generateBtn.disabled = true;
    
    try {
        let imageContainer = document.getElementById('generated-image-container');
        if (!imageContainer) {
            imageContainer = document.createElement('div');
            imageContainer.id = 'generated-image-container';
            imageContainer.className = 'generated-image-container';
            imageContainer.style.display = 'none';
            
            const generateBtn = document.getElementById('generate-image-btn');
            if (generateBtn && generateBtn.parentNode) {
                generateBtn.parentNode.insertBefore(imageContainer, generateBtn.nextSibling);
            }
        }
        
        // Show the container
        imageContainer.style.display = 'block';
        imageContainer.style.visibility = 'visible';
        imageContainer.style.opacity = '1';
        
        // Show loading placeholders
        const loadingPlaceholders = Array(2).fill(0).map((_, index) => `
            <div class="generated-image-item" style="animation-delay: ${index * 0.2}s;">
                <div class="image-wrapper loading">
                    <div class="image-loading-overlay">
                        <div class="loading-spinner-small"></div>
                        <div class="loading-text-small">🌅 Creating tomorrow's look...</div>
                        <div class="loading-progress-small">
                            <div class="loading-progress-fill-small"></div>
                        </div>
                    </div>
                </div>
                <p class="image-description">Generating tomorrow's AI outfit image...</p>
                <p class="image-usage">Fashion forecast</p>
            </div>
        `).join('');
        
        imageContainer.innerHTML = `
            <div class="generated-images-header">
                <h4>🌅 Creating Tomorrow's AI-Generated Outfit</h4>
                <p>Perfect for tomorrow's weather forecast</p>
            </div>
            <div class="generated-images-grid">
                ${loadingPlaceholders}
            </div>
        `;
        
        // Force scroll to container
        imageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Generate images using the existing function
        const tomorrowPrompt = `Tomorrow's fashion forecast: ${tomorrowAppState.outfitPrompt}`;
        
        if (typeof generateMultipleImages === 'function') {
            const imageResults = await generateMultipleImages(tomorrowPrompt, tomorrowAppState.selectedGender);
            
            if (imageResults.length > 0) {
                // Use existing display function
                if (typeof displayGeneratedImages === 'function') {
                    displayGeneratedImages(imageResults, imageContainer, tomorrowPrompt);
                }
            } else {
                // Show error message
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
                        <h4 style="color: #dc2626; margin-bottom: 12px;">Tomorrow's Image Generation Failed</h4>
                        <p style="color: #7f1d1d; margin-bottom: 20px;">Unable to generate tomorrow's outfit images. Please try again.</p>
                        <button onclick="generateTomorrowOutfitImage()" style="
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
        }
        
        // Ensure prompts remain hidden
        if (aiPromptElement) aiPromptElement.classList.add('hidden');
        if (promptPreviewElement) {
            promptPreviewElement.style.display = 'none';
            promptPreviewElement.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ Tomorrow\'s image generation failed:', error);
        if (typeof showImageGenerationError === 'function') {
            showImageGenerationError(imageContainer);
        }
    } finally {
        // Restore button
        if (generateBtn) {
            generateBtn.innerHTML = originalContent;
            generateBtn.disabled = false;
        }
    }
}

// Generate images using multiple free AI services focused on people
async function generateMultipleImages(prompt, gender) {
    const imageResults = [];
    
    try {
        // Add multiple layers of randomization for unique images
        const timestamp = Date.now();
        const randomSeed = Math.floor(Math.random() * 1000000);
        const sessionId = Math.random().toString(36).substring(7);
        
        // Gender-specific subject description
        const genderSubject = gender === 'female' ? 'a beautiful female model' : 'a handsome male model';

        // Multiple style variations for more diversity
        const styleVariations = [
            'professional fashion model',
            'stylish person',
            'elegant individual',
            'fashionable model',
            'trendy fashion influencer',
            'sophisticated dresser',
            'chic fashion enthusiast',
            'modern style icon',
            'runway model',
            'magazine cover model',
            'street style icon',
            'high fashion editorial',
            'minimalist aesthetic',
            'avant-garde fashion'
        ];
        
        const backgroundVariations = [
            'urban street background',
            'modern studio setting',
            'outdoor natural lighting',
            'minimalist backdrop',
            'city environment',
            'contemporary setting',
            'dramatic cityscape',
            'serene nature backdrop',
            'futuristic architecture',
            'vintage industrial space',
            'luxury interior'
        ];
        
        const poseVariations = [
            'confident pose',
            'casual stance',
            'elegant posture',
            'dynamic pose',
            'relaxed position',
            'fashion pose',
            'walking pose',
            'sitting pose',
            'candid shot',
            'profile view',
            'full body view'
        ];
        
        const selectedStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];
        const selectedBackground = backgroundVariations[Math.floor(Math.random() * backgroundVariations.length)];
        const selectedPose = poseVariations[Math.floor(Math.random() * poseVariations.length)];
        
        const enhancedPrompt = `${genderSubject}, ${selectedStyle} ${prompt}, ${selectedPose}, ${selectedBackground}, no objects only, no clothing items only, must show person wearing clothes, human figure required, fashion model, person visible, realistic photography, high quality, detailed`;
        
        // Method 1: Use Pollinations AI with Flux model
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=768&model=flux&enhance=true&nologo=true&seed=${Date.now()}&timestamp=${timestamp}&session=${sessionId}`;
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
        
        const altPrompt = `${genderSubject}, ${altStyle} wearing ${prompt}, ${altPose}, ${altBackground}, photorealistic, high fashion, professional photography, detailed clothing, person clearly visible, full body shot`;
        const pollinationsUrl2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(altPrompt)}?width=512&height=768&model=turbo&enhance=true&seed=${Date.now() + 1}&timestamp=${timestamp + 1000}&session=${sessionId}_alt`;
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
            <h4>🌅 Your Tomorrow's AI-Generated Outfit</h4>
            <p>Perfect for tomorrow's weather forecast</p>
        </div>
        <div class="generated-images-grid">
            ${imagesHTML}
        </div>
        <div class="image-actions">
            <button onclick="generateTomorrowOutfitImage()" class="regenerate-btn">
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
                gender: tomorrowAppState.selectedGender,
                timestamp: Date.now()
            };
            try {
                if (typeof saveLikedOutfit === 'function') {
                    await saveLikedOutfit(likedOutfit);
                    event.target.textContent = '❤️ Liked!';
                    event.target.disabled = true;
                }
            } catch (error) {
                console.error('Error liking image:', error);
                alert('Failed to save liked image. Please try again.');
            }
        });
    });
    
    // Hide the AI image prompt element after images are displayed.
    const aiPromptElement = document.getElementById('ai-prompt');
    if (aiPromptElement) {
        aiPromptElement.classList.add('hidden');
    }
}

// Loading state management for tomorrow page
function showLoadingState() {
    const loadingSection = document.getElementById('loading-section');
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');
    const productRecommendationsSection = document.querySelector('.product-recommendations');
    const errorSection = document.getElementById('error-section');

    // Hide all main content sections and show only loading
    if (loadingSection) loadingSection.classList.remove('hidden');
    if (weatherSection) weatherSection.classList.add('hidden');
    if (outfitSection) outfitSection.classList.add('hidden');
    if (productRecommendationsSection) productRecommendationsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function hideLoadingState() {
    const loadingSection = document.getElementById('loading-section');
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');
    const productRecommendationsSection = document.querySelector('.product-recommendations');
    const errorSection = document.getElementById('error-section');

    // Hide all main content and loading sections
    if (loadingSection) loadingSection.classList.add('hidden');
    if (weatherSection) weatherSection.classList.add('hidden');
    if (outfitSection) outfitSection.classList.add('hidden');
    if (productRecommendationsSection) productRecommendationsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function showMainContent() {
    const weatherSection = document.getElementById('weather-section');
    const outfitSection = document.getElementById('outfit-section');
    const productRecommendationsSection = document.querySelector('.product-recommendations');
    const loadingSection = document.getElementById('loading-section');
    const errorSection = document.getElementById('error-section');

    // Show main content sections, hide loading and error
    if (loadingSection) loadingSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
    if (weatherSection) weatherSection.classList.remove('hidden');
    if (outfitSection) outfitSection.classList.remove('hidden');
    if (productRecommendationsSection) productRecommendationsSection.classList.remove('hidden');
}

function updateLoadingStep(stepName, status) {
    const stepElement = document.getElementById(`step-${stepName}`);
    if (stepElement) {
        stepElement.className = `step ${status}`;
        tomorrowAppState.steps[stepName] = status === 'completed';
    }
}

// Error handling for tomorrow page
function handleAppError(error) {
    console.error('❌ Tomorrow application error:', error);
    
    hideLoadingState(); // This hides all content except error
    const errorMessageElement = document.getElementById('error-message');
    const errorSectionElement = document.getElementById('error-section');

    if (errorMessageElement) {
        errorMessageElement.textContent = error.message || 'An unexpected error occurred. Please refresh the page and try again.';
    }
    if (errorSectionElement) {
        errorSectionElement.classList.remove('hidden');
    }
}

// Show image generation error for tomorrow page
function showImageGenerationError(container) {
    container.innerHTML = `
        <div class="image-error">
            <div class="error-icon">⚠️</div>
            <h4>Tomorrow's Image Generation Temporarily Unavailable</h4>
            <p>Please try generating tomorrow's images again in a few moments</p>
            <button onclick="generateTomorrowOutfitImage()" class="retry-btn">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">Try Again</span>
            </button>
        </div>
    `;
}

// IndexedDB setup for liked outfits (simplified version)
let db = null;
const DB_NAME = 'AIOutfitDB';
const DB_VERSION = 1;
const STORE_NAME = 'likedOutfits';

async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB: Error opening database');
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB: Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log('IndexedDB: Database upgrade needed');
            
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('IndexedDB: Object store created');
            }
        };
    });
}

async function saveLikedOutfit(outfitData) {
    await openIndexedDB();

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

// Initialize the tomorrow app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the tomorrow preview page
    if (window.location.pathname.includes('tomorrow-preview') || 
        document.title.includes('Tomorrow\'s Outfit Preview')) {
        initializeTomorrowApp();
    }
});

// Make the function globally available
window.generateTomorrowOutfitImage = generateTomorrowOutfitImage;