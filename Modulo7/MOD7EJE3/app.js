// Sistema de filtrado y orden inteligente de Masonry

document.addEventListener('DOMContentLoaded', function() {
    // 1. Seleccionar elementos
    const cards = document.querySelectorAll('.card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // 2. Sistema de filtrado
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Actualizar botón activo
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filtrar tarjetas
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || filter === category) {
                    card.style.display = 'flex';
                    card.style.animation = 'cardAppear 0.6s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Reorganizar grid después de filtrar
            setTimeout(() => {
                reorganizeGrid();
            }, 300);
        });
    });
    
    // 3. Reorganización inteligente del grid
    function reorganizeGrid() {
        const visibleCards = Array.from(cards).filter(card => 
            card.style.display !== 'none'
        );
        
        // Redistribuir clases de tamaño para mejor equilibrio visual
        let tallCount = 0;
        let wideCount = 0;
        let bigCount = 0;
        
        visibleCards.forEach((card, index) => {
            // Remover clases de tamaño existentes (excepto featured)
            if (!card.classList.contains('card-featured')) {
                card.classList.remove('card-tall', 'card-wide', 'card-big');
            }
            
            // No modificar las tarjetas ya clasificadas manualmente
            if (card.classList.contains('card-featured')) {
                return;
            }
            
            // Patrón inteligente basado en posición
            const patternPosition = index % 8;
            
            switch(patternPosition) {
                case 0:
                case 3:
                    // Tarjetas altas en posiciones 0 y 3
                    card.classList.add('card-tall');
                    tallCount++;
                    break;
                case 2:
                case 5:
                    // Tarjetas anchas en posiciones 2 y 5
                    if (wideCount < 2) {
                        card.classList.add('card-wide');
                        wideCount++;
                    } else {
                        card.classList.add('card-tall');
                        tallCount++;
                    }
                    break;
                case 6:
                    // Una tarjeta grande en posición 6
                    if (bigCount < 1) {
                        card.classList.add('card-big');
                        bigCount++;
                    } else {
                        card.classList.add('card-wide');
                        wideCount++;
                    }
                    break;
                default:
                    // Tarjetas normales para el resto
                    break;
            }
        });
        
        console.log(`Distribución optimizada:
        - Tarjetas altas: ${tallCount}
        - Tarjetas anchas: ${wideCount}
        - Tarjetas grandes: ${bigCount}`);
        
        // Efecto de aparición escalonada
        visibleCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });
    }
    
    // 4. Inicializar el grid
    reorganizeGrid();
    
    // 5. Lazy loading mejorado
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.1
    });
    
    // Observar cada tarjeta para lazy loading
    cards.forEach(card => {
        imageObserver.observe(card);
    });
    
    // 6. Efecto de hover mejorado con eventos
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
    
    // 7. Orden aleatorio inicial para variedad (opcional)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 8. Reordenar las tarjetas periódicamente (cada 30 segundos)
    setInterval(() => {
        const visibleCards = Array.from(cards).filter(card => 
            card.style.display !== 'none'
        );
        
        if (visibleCards.length > 0) {
            const shuffledCards = shuffleArray([...visibleCards]);
            
            // Reinsertar en orden aleatorio
            shuffledCards.forEach(card => {
                galleryGrid.appendChild(card);
            });
            
            // Reorganizar con nuevo orden
            reorganizeGrid();
        }
    }, 30000);
});
