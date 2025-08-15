document.addEventListener('DOMContentLoaded', () => {
    // --- Loading Animation ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        window.addEventListener('load', () => loaderWrapper.classList.add('loader-hidden'));
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    }

    // --- Carousel Logic ---
    const carouselItems = document.querySelectorAll('.carousel-item');
    if (carouselItems.length > 0) {
        let currentIndex = 2; // Center item for 5 items

        const updateCarousel = () => {
            carouselItems.forEach((item, index) => {
                let offset = index - currentIndex;
                if (offset > 2) offset -= 5;
                if (offset < -2) offset += 5;

                item.classList.toggle('active', offset === 0);
                item.style.transform = offset === 0 ? 'translateX(0) scale(1)' : `translateX(${offset * 110}%) scale(0.8)`;
                item.style.opacity = offset === 0 ? '1' : '0.5';
                item.style.zIndex = offset === 0 ? '4' : '1';
            });
        };

        updateCarousel();
        setInterval(() => {
            currentIndex = (currentIndex + 1) % 5;
            updateCarousel();
        }, 2000);
    }

    // --- Search and Filter Functionality ---
    const searchInput = document.getElementById('searchInput');
    const animeCards = document.querySelectorAll('.anime-card');
    if (searchInput && animeCards.length > 0) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestionsContainer);

        const animeData = Array.from(animeCards).map(card => ({
            element: card,
            title: card.dataset.title.toLowerCase(),
            genres: card.dataset.genres?.split(' ') || [],
            year: card.dataset.year,
            status: card.dataset.status,
            popularity: parseFloat(card.dataset.popularity) || 0,
            img: card.querySelector('img')?.src || ''
        }));

        const searchAnime = query => {
            query = query.toLowerCase().trim();
            return animeData.filter(anime =>
                anime.title.includes(query) ||
                anime.genres.some(genre => genre.includes(query))

            );
        };

        const filterAnime = () => {
            const genre = document.getElementById('genre-filter')?.value || 'all';
            const year = document.getElementById('year-filter')?.value || 'all';
            const status = document.getElementById('status-filter')?.value || 'all';
            const sort = document.getElementById('sort-by')?.value || 'latest';

            let filtered = animeData.filter(anime =>
                (genre === 'all' || anime.genres.includes(genre)) &&
                (year === 'all' || anime.year === year) &&
                (status === 'all' || anime.status === status)
            );

            if (sort === 'a-z') filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (sort === 'popularity') filtered.sort((a, b) => b.popularity - a.popularity);
            else if (sort === 'latest') filtered.sort((a, b) => (b.year || 0) - (a.year || 0));

            return filtered;
        };

        const updateAnimeGrid = animeList => {
            animeCards.forEach(card => card.classList.add('hidden'));
            animeList.forEach(anime => anime.element.classList.remove('hidden'));
        };

        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            suggestionsContainer.innerHTML = '';

            if (query.length > 1) {
                const results = searchAnime(query);
                suggestionsContainer.style.display = 'block';

                if (results.length) {
                    results.slice(0, 5).forEach(anime => {
                        const suggestion = document.createElement('div');
                        suggestion.className = 'suggestion-item';
                        suggestion.innerHTML = `
                            <img src="${anime.img}" alt="${anime.title}">
                            <div>
                                <div class="title">${anime.element.dataset.title}</div>
                                <div class="genres">${anime.element.dataset.genres || ''}</div>
                            </div>
                        `;
                        suggestion.addEventListener('click', () => {
                            searchInput.value = anime.element.dataset.title;
                            suggestionsContainer.style.display = 'none';
                            updateAnimeGrid(filterAnime().filter(item => item.title === anime.title));
                        });
                        suggestionsContainer.appendChild(suggestion);
                    });
                } else {
                    suggestionsContainer.innerHTML = `
                        <div class="suggestion-item no-results">
                            <div class="no-results-content">
                                <i class="fas fa-search"></i>
                                <div>No results found for "${query}"</div>
                                <small>Try different keywords or check your spelling</small>
                            </div>
                        </div>`;
                }
            } else {
                suggestionsContainer.style.display = 'none';
                updateAnimeGrid(filterAnime());
            }
        });

        document.querySelector('.btn-filter')?.addEventListener('click', () => updateAnimeGrid(filterAnime()));
        document.addEventListener('click', e => {
            if (!searchInput.parentNode.contains(e.target)) suggestionsContainer.style.display = 'none';
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(anchor.getAttribute('href'))?.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Filter Buttons ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length) {
        let activeFilter = { type: 'type', value: 'all' };
        document.querySelector('.filter-btn[data-value="all"]')?.classList.add('active');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeFilter = {
                    type: button.dataset.filter,
                    value: button.dataset.value
                };
                document.querySelectorAll('.anime-card').forEach(card => {
                    card.style.display = (activeFilter.value === 'all' || card.dataset[activeFilter.type] === activeFilter.value)
                        ? 'block' : 'none';
                });
            });
        });
    }
});

document.getElementById('trailerButton').addEventListener('click', function () {
    const youtubeId = this.getAttribute('data-youtube-id');
    const modal = document.getElementById('youtubeModal');

    // Insert YouTube iframe
    document.getElementById('youtubePlayer').innerHTML = `
                        <iframe width="100%" height="100%" 
                          src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" 
                          frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowfullscreen
                          style="position:absolute; top:0; left:0;">
                        </iframe>
                      `;

    // Show modal
    modal.style.display = 'flex';
});

// Close modal when clicking X
document.querySelector('.close-modal').addEventListener('click', function () {
    const modal = document.getElementById('youtubeModal');
    modal.style.display = 'none';
    // Clear the iframe to stop video playback
    document.getElementById('youtubePlayer').innerHTML = '';
});

// Close modal when clicking outside the video
document.getElementById('youtubeModal').addEventListener('click', function (e) {
    if (e.target === this) {
        this.style.display = 'none';
        // Clear the iframe to stop video playback
        document.getElementById('youtubePlayer').innerHTML = '';
    }
});