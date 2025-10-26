// VP fiyatları ve döviz kurları
let vpPrices = {
    "125": { TRY: 15.0, USD: 1.0, EUR: 0.9 },
    "420": { TRY: 50.0, USD: 4.0, EUR: 3.6 },
    "700": { TRY: 80.0, USD: 7.0, EUR: 6.3 },
    "1375": { TRY: 150.0, USD: 14.0, EUR: 12.6 },
    "2400": { TRY: 250.0, USD: 23.0, EUR: 20.7 },
    "4000": { TRY: 400.0, USD: 37.0, EUR: 33.3 },
    "8150": { TRY: 800.0, USD: 74.0, EUR: 66.6 }
};

let currentCurrency = 'TRY';
let exchangeRates = { USD: 1, EUR: 0.9, TRY: 32.0 }; // Örnek kurlar

// Valorant API'den veri çekme
async function fetchValorantData() {
    try {
        // Store endpoint'ini simüle ediyoruz (gerçek store API'si authentication gerektirir)
        const response = await fetch('https://valorant-api.com/v1/currencies');
        const data = await response.json();
        
        document.getElementById('apiStatus').innerHTML = '<span style="color: #00ff88;">✅ Bağlı</span>';
        console.log('Valorant API bağlantısı başarılı');
        
        return data;
    } catch (error) {
        console.log('Valorant API hatası:', error);
        document.getElementById('apiStatus').innerHTML = '<span style="color: #ff4655;">❌ Bağlantı hatası</span>';
        return null;
    }
}

// Döviz kurlarını güncelleme
async function fetchExchangeRates() {
    try {
        // Ücretsiz döviz API'si (alternatif olarak kullanabilirsin)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data && data.rates) {
            exchangeRates = {
                USD: 1,
                EUR: data.rates.EUR || 0.9,
                TRY: data.rates.TRY || 32.0
            };
        }
    } catch (error) {
        console.log('Döviz kuru API hatası, varsayılan değerler kullanılıyor:', error);
    }
}

// Para birimini değiştirme
function changeCurrency() {
    currentCurrency = document.getElementById('currency').value;
    updatePriceList();
    calculatePrice(); // Mevcut hesaplamayı güncelle
}

// Fiyat hesaplama fonksiyonu
function calculatePrice() {
    const vpAmount = parseInt(document.getElementById('vpAmount').value);
    const resultDiv = document.getElementById('result');
    
    if (!vpAmount || vpAmount <= 0) {
        resultDiv.innerHTML = '<span style="color: #ff4655;">⚠️ Lütfen geçerli bir VP miktarı girin!</span>';
        return;
    }

    // En yakın paketleri bulma
    const packages = Object.keys(vpPrices).map(Number).sort((a, b) => a - b);
    let recommendedPackage = packages.find(pkg => pkg >= vpAmount) || packages[packages.length - 1];
    
    const price = vpPrices[recommendedPackage][currentCurrency];
    const pricePerVP = (price / recommendedPackage).toFixed(3);
    
    // Özel hesaplamalar
    const customCalculations = calculateCustomPackages(vpAmount);
    
    resultDiv.innerHTML = `
        <div style="font-size: 1.2em; margin-bottom: 15px;">
            <strong>${vpAmount.toLocaleString()} VP için:</strong>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin: 10px 0;">
            🎯 <strong>Önerilen paket:</strong> ${recommendedPackage.toLocaleString()} VP<br>
            💰 <strong>Fiyat:</strong> ${formatPrice(price)}<br>
            📊 <strong>VP başına:</strong> ${formatPrice(pricePerVP)}
        </div>
        ${customCalculations}
    `;
}

// Özel paket kombinasyonları hesaplama
function calculateCustomPackages(vpAmount) {
    const packages = Object.keys(vpPrices).map(Number).sort((a, b) => b - a); // Büyükten küçüğe
    let remainingVP = vpAmount;
    let combinations = [];
    let totalPrice = 0;

    // En verimli kombinasyonu bulmaya çalış
    for (let pkg of packages) {
        const count = Math.floor(remainingVP / pkg);
        if (count > 0) {
            const price = vpPrices[pkg][currentCurrency] * count;
            combinations.push({ vp: pkg, count: count, price: price });
            totalPrice += price;
            remainingVP -= pkg * count;
        }
    }

    // Kalan VP için küçük paket ekle
    if (remainingVP > 0) {
        const smallPackage = Object.keys(vpPrices).map(Number).sort((a, b) => a - b)
            .find(pkg => pkg >= remainingVP);
        if (smallPackage) {
            const price = vpPrices[smallPackage][currentCurrency];
            combinations.push({ vp: smallPackage, count: 1, price: price });
            totalPrice += price;
            remainingVP = 0;
        }
    }

    if (combinations.length > 1) {
        let html = `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
            <strong>🔀 Alternatif Paket Kombinasyonları:</strong><br>`;
        
        combinations.forEach(combo => {
            html += `<div style="margin: 5px 0;">→ ${combo.count} × ${combo.vp} VP = ${formatPrice(combo.price)}</div>`;
        });
        
        html += `<div style="margin-top: 10px; font-weight: bold;">🎯 Toplam: ${formatPrice(totalPrice)}</div>`;
        html += `</div>`;
        
        return html;
    }
    
    return '';
}

// Fiyat listesini güncelleme
function updatePriceList() {
    const priceListDiv = document.getElementById('priceList');
    let html = '<div class="price-grid">';
    
    Object.keys(vpPrices).sort((a, b) => a - b).forEach(vp => {
        const price = vpPrices[vp][currentCurrency];
        const vpPerMoney = (vp / price).toFixed(1);
        
        html += `
            <div class="price-item">
                <div style="font-size: 1.1em; font-weight: bold; color: #ff4655;">${vp} VP</div>
                <div style="font-size: 1.3em; margin: 8px 0;">${formatPrice(price)}</div>
                <div style="font-size: 0.9em; opacity: 0.8;">${vpPerMoney} VP/${getCurrencySymbol()}</div>
            </div>
        `;
    });
    
    html += '</div>';
    priceListDiv.innerHTML = html;
}

// Fiyat formatlama
function formatPrice(price) {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    return `${symbols[currentCurrency]} ${parseFloat(price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCurrencySymbol() {
    const symbols = { TRY: '₺', USD: '$', EUR: '€' };
    return symbols[currentCurrency];
}

// Özel hesaplamaları güncelleme
function updateCustomCalculations() {
    const customDiv = document.getElementById('customCalculations');
    const popularAmounts = [100, 500, 1000, 2000, 5000];
    
    let html = '';
    popularAmounts.forEach(amount => {
        const packages = Object.keys(vpPrices).map(Number).sort((a, b) => a - b);
        let recommended = packages.find(pkg => pkg >= amount) || packages[packages.length - 1];
        const price = vpPrices[recommended][currentCurrency];
        
        html += `
            <div class="custom-calc-item">
                <strong>${amount} VP</strong> → ${recommended} VP = ${formatPrice(price)}
            </div>
        `;
    });
    
    customDiv.innerHTML = html;
}

// Son güncelleme zamanını güncelleme
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async function() {
    updatePriceList();
    updateCustomCalculations();
    updateLastUpdate();
    
    // API'lerden verileri çek
    await Promise.all([
        fetchValorantData(),
        fetchExchangeRates()
    ]);
    
    // Her 5 dakikada bir fiyatları güncelle
    setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    // Enter tuşu ile hesaplama
    document.getElementById('vpAmount').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculatePrice();
        }
    });
});
