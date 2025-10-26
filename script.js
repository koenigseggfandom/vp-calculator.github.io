// VP fiyatları (başlangıç değerleri)
let vpPrices = {
    "125": 15.0,
    "420": 50.0,
    "700": 80.0,
    "1375": 150.0,
    "2400": 250.0,
    "4000": 400.0,
    "8150": 800.0
};

// API'den güncel fiyatları çekme
async function fetchPrices() {
    try {
        const response = await fetch('https://api.example.com/valorant-prices'); // Örnek API
        const data = await response.json();
        
        if (data && data.prices) {
            vpPrices = data.prices;
            updatePriceList();
            updateLastUpdate();
        }
    } catch (error) {
        console.log('API hatası, yerel fiyatlar kullanılıyor:', error);
    }
}

// Fiyat hesaplama fonksiyonu
function calculatePrice() {
    const vpAmount = document.getElementById('vpAmount').value;
    const resultDiv = document.getElementById('result');
    
    if (!vpAmount || vpAmount <= 0) {
        resultDiv.innerHTML = '<span style="color: red;">Lütfen geçerli bir VP miktarı girin!</span>';
        return;
    }

    // En yakın paketi bulma
    const packages = Object.keys(vpPrices).map(Number).sort((a, b) => a - b);
    let recommendedPackage = packages.find(pkg => pkg >= vpAmount) || packages[packages.length - 1];
    
    const price = vpPrices[recommendedPackage];
    const pricePerVP = (price / recommendedPackage).toFixed(3);
    
    resultDiv.innerHTML = `
        <strong>${vpAmount} VP için:</strong><br>
        Önerilen paket: <strong>${recommendedPackage} VP</strong><br>
        Fiyat: <strong>${price} TL</strong><br>
        VP başına: <strong>${pricePerVP} TL</strong>
    `;
}

// Fiyat listesini güncelleme
function updatePriceList() {
    const priceListDiv = document.getElementById('priceList');
    let html = '';
    
    Object.keys(vpPrices).sort((a, b) => a - b).forEach(vp => {
        html += `
            <div class="price-item">
                <span>${vp} VP</span>
                <span><strong>${vpPrices[vp]} TL</strong></span>
            </div>
        `;
    });
    
    priceListDiv.innerHTML = html;
}

// Son güncelleme zamanını güncelleme
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    updatePriceList();
    updateLastUpdate();
    fetchPrices(); // API'den güncel fiyatları çek
    
    // Her 1 saatte bir fiyatları güncelle
    setInterval(fetchPrices, 60 * 60 * 1000);
});