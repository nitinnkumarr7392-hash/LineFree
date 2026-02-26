class LineFreeApp {
    constructor() {
        this.map = null;
        this.markers = {};
        this.currentLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi default
        this.places = [
            { id: 1, name: 'AIIMS Hospital', cat: 'hospital', lat: 28.6110, lng: 77.2220, people: 15, status: 'long', est: '45 min' },
            { id: 2, name: 'SBI Bank', cat: 'bank', lat: 28.6200, lng: 77.2000, people: 5, status: 'short', est: '10 min' },
            { id: 3, name: 'Delhi Secretariat', cat: 'govt', lat: 28.6140, lng: 77.2300, people: 25, status: 'long', est: '60 min' },
            { id: 4, name: 'Lotus Temple', cat: 'temple', lat: 28.5460, lng: 77.2500, people: 8, status: 'medium', est: '20 min' },
            { id: 5, name: 'PNB Bank', cat: 'bank', lat: 28.6000, lng: 77.2100, people: 3, status: 'short', est: '5 min' }
        ];
        this.init();
    }

    init() {
        this.loadMap();
        this.getLocation();
        this.bindEvents();
        this.renderPlaces();
        this.loadQueueData();
    }

    loadMap() {
        this.map = L.map('map').setView([this.currentLocation.lat, this.currentLocation.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
        this.addMarkers();
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                this.currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 13);
                this.renderPlaces();
            });
        }
    }

    addMarkers() {
        this.places.forEach(place => {
            const statusColor = place.status === 'short' ? 'green' : place.status === 'medium' ? 'orange' : 'red';
            const marker = L.marker([place.lat, place.lng]).addTo(this.map)
                .bindPopup(`<b>${place.name}</b><br>Status: ${place.status.toUpperCase()}<br>${place.est}`);
            marker.place = place;
            this.markers[place.id] = marker;
        });
    }

    bindEvents() {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterPlaces(e.target.value));
        
        // Categories
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.cat-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.filterPlaces('', e.target.dataset.cat);
            });
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('updateBtn').addEventListener('click', () => this.updateQueue());
    }

    renderPlaces(filter = '', category = 'all') {
        const list = document.getElementById('placesList');
        let filtered = this.places.filter(p => 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || filter === '') &&
            (category === 'all' || p.cat === category)
        );
        list.innerHTML = filtered.map(place => `
            <div class="place-item" data-id="${place.id}">
                <div class="place-icon">🏥</div>
                <div class="place-info">
                    <h3>${place.name}</h3>
                    <div class="status ${place.status}">${place.status === 'short' ? '🟢 Short' : place.status === 'medium' ? '🟡 Medium' : '🔴 Long'}</div>
                    <div class="est-time">⏳ ${place.est}</div>
                    <div class="last-updated">Last updated: ${place.lastUpdated || 'just now'}</div>
                </div>
            </div>
        `).join('');

        // Click handlers
        document.querySelectorAll('.place-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.openDetail(id);
            });
        });
    }

    filterPlaces(search, category = 'all') {
        this.renderPlaces(search, category);
    }

    openDetail(id) {
        const place = this.places.find(p => p.id === id);
        document.getElementById('placeName').textContent = place.name;
        document.getElementById('queueStatus').innerHTML = `<span class="status ${place.status}">${place.status.toUpperCase()}</span>`;
        document.getElementById('estTime').textContent = `⏳ Estimated: ${place.est}`;
        document.getElementById('lastUpdated').textContent = `Last updated: ${place.lastUpdated || 'just now'}`;
        document.getElementById('detailModal').style.display = 'block';
        document.getElementById('peopleAhead').focus();
        this.currentPlace = place;
    }

    closeModal() {
        document.getElementById('detailModal').style.display = 'none';
    }

    updateQueue() {
        const people = parseInt(document.getElementById('peopleAhead').value);
        const est = people < 5 ? '5-10 min' : people < 15 ? '15-30 min' : '45+ min';
        const status = people < 5 ? 'short' : people < 15 ? 'medium' : 'long';

        this.currentPlace.people = people;
        this.currentPlace.status = status;
        this.currentPlace.est = est;
        this.currentPlace.lastUpdated = new Date().toLocaleString('hi-IN');

        // Save to localStorage
        this.saveQueueData();

        // Update UI
        this.openDetail(this.currentPlace.id);
        this.renderPlaces();
        this.updateMarker(this.currentPlace);

        alert('✅ Queue update successful! Thanks bhai!');
    }

    updateMarker(place) {
        const color = place.status === 'short' ? 'green' : place.status === 'medium' ? 'orange' : 'red';
        this.markers[place.id].setPopupContent(`<b>${place.name}</b><br>Status: ${place.status.toUpperCase()}<br>${place.est}`);
    }

    saveQueueData() {
        localStorage.setItem('linefree_queues', JSON.stringify(this.places));
    }

    loadQueueData() {
        const data = localStorage.getItem('linefree_queues');
        if (data) {
            const saved = JSON.parse(data);
            this.places.forEach((place, i) => {
                if (saved[i]) Object.assign(place, saved[i]);
            });
        }
    }
}

// Start app
new LineFreeApp();
