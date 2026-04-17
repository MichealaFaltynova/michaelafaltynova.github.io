document.addEventListener('DOMContentLoaded', () => {

    const nav          = document.querySelector('.nav');
    const hamburger    = document.querySelector('.nav__hamburger');
    const mobileMenu   = document.querySelector('.nav__mobile');
    const mobileLinks  = document.querySelectorAll('.nav__mobile-link');

    
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    });

    
    hamburger?.addEventListener('click', () => {
        const jeOtevren = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', jeOtevren);
        hamburger.setAttribute('aria-expanded', jeOtevren);
    });

    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    const countdownEl = document.getElementById('countdown');

    if (countdownEl) {
        
        const cilDatum = new Date(countdownEl.dataset.datum || '2026-05-15T10:00:00');

        const elDny    = document.getElementById('cd-dny');
        const elHodiny = document.getElementById('cd-hodiny');
        const elMin    = document.getElementById('cd-minuty');
        const elSec    = document.getElementById('cd-sekundy');

        
        function aktualizujCountdown() {
            const nyni = new Date();
            const rozdil = cilDatum - nyni;

            if (rozdil <= 0) {
                
                countdownEl.closest('.countdown').innerHTML =
                    '<p class="countdown__title">Výstava právě probíhá! Přijďte nás navštívit.</p>';
                return;
            }

            const dny    = Math.floor(rozdil / (1000 * 60 * 60 * 24));
            const hodiny = Math.floor((rozdil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minuty = Math.floor((rozdil % (1000 * 60 * 60)) / (1000 * 60));
            const sek    = Math.floor((rozdil % (1000 * 60)) / 1000);

            if (elDny)    elDny.textContent    = String(dny).padStart(2, '0');
            if (elHodiny) elHodiny.textContent = String(hodiny).padStart(2, '0');
            if (elMin)    elMin.textContent    = String(minuty).padStart(2, '0');
            if (elSec)    elSec.textContent    = String(sek).padStart(2, '0');
        }

        aktualizujCountdown();
        setInterval(aktualizujCountdown, 1000);
    }

    

    const expoziceContainer = document.getElementById('expozice-grid');

    
    function vytvorKartuExpozice(exp) {
        return `
            <article class="expozice__karta reveal" data-kategorie="${exp.kategorie}">
                <img
                    class="expozice__karta-img"
                    src="${exp.obrazek}"
                    alt="Expozice: ${exp.nazev}"
                    loading="lazy"
                >
                <div class="expozice__karta-body">
                    <span class="expozice__karta-tag">${exp.kategorie}</span>
                    <h3 class="expozice__karta-nazev">${exp.nazev}</h3>
                    <p class="expozice__karta-popis">${exp.popis}</p>
                </div>
            </article>`;
    }

   
    async function nactiExpozice() {
        if (!expoziceContainer) return;

        try {
            const odpoved = await fetch('php/nacti_expozice.php');

            if (!odpoved.ok) {
                throw new Error(`HTTP ${odpoved.status}`);
            }

            const data = await odpoved.json();

           
            window._expoziceData = data;

            expoziceContainer.innerHTML = data.map(vytvorKartuExpozice).join('');

            
            inicializujReveal();

        } catch (chyba) {
            console.error('Chyba při načítání expozic:', chyba);
            expoziceContainer.innerHTML =
                '<p style="text-align:center;color:var(--clr-text-muted)">Expozice se nepodařilo načíst.</p>';
        }
    }

    nactiExpozice();

    

    const filtryContainer = document.querySelector('.expozice__filtry');

    filtryContainer?.addEventListener('click', (e) => {
        const btn = e.target.closest('.expozice__filtr-btn');
        if (!btn) return;

        
        filtryContainer.querySelectorAll('.expozice__filtr-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const kategorie = btn.dataset.kategorie;
        const karty = expoziceContainer?.querySelectorAll('.expozice__karta');

        karty?.forEach(karta => {
            const shoda = kategorie === 'vse' || karta.dataset.kategorie === kategorie;
            karta.style.display = shoda ? '' : 'none';
        });
    });


    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach(carouselEl => {
        const track     = carouselEl.querySelector('.carousel__track');
        const slides    = carouselEl.querySelectorAll('.carousel__slide');
        const btnPrev   = carouselEl.querySelector('.carousel__btn--prev');
        const btnNext   = carouselEl.querySelector('.carousel__btn--next');
        const dotsWrap  = carouselEl.querySelector('.carousel__dots');

        if (!track || slides.length === 0) return;

        
        function pocetViditelnych() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        let aktualniIndex = 0;
        let viditelnych   = pocetViditelnych();
        const maxIndex    = () => Math.max(0, slides.length - viditelnych);

        
        function vytvorTecky() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';

            const pocet = maxIndex() + 1;
            for (let i = 0; i < pocet; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel__dot');
                dot.setAttribute('aria-label', `Slajd ${i + 1}`);
                if (i === 0) dot.classList.add('active');

                dot.addEventListener('click', () => {
                    aktualniIndex = i;
                    aktualizujCarousel();
                });

                dotsWrap.appendChild(dot);
            }
        }

       
        function aktualizujCarousel() {
            
            const slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).marginRight);
            track.style.transform = `translateX(-${aktualniIndex * slideWidth}px)`;

            
            dotsWrap?.querySelectorAll('.carousel__dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === aktualniIndex);
            });

            
            if (btnPrev) btnPrev.disabled = aktualniIndex === 0;
            if (btnNext) btnNext.disabled = aktualniIndex >= maxIndex();
        }

        btnPrev?.addEventListener('click', () => {
            if (aktualniIndex > 0) {
                aktualniIndex--;
                aktualizujCarousel();
            }
        });

        btnNext?.addEventListener('click', () => {
            if (aktualniIndex < maxIndex()) {
                aktualniIndex++;
                aktualizujCarousel();
            }
        });

        
        let zacatekDotyk = 0;
        track.addEventListener('touchstart', e => { zacatekDotyk = e.touches[0].clientX; });
        track.addEventListener('touchend', e => {
            const rozdil = zacatekDotyk - e.changedTouches[0].clientX;
            if (Math.abs(rozdil) > 50) {
                if (rozdil > 0 && aktualniIndex < maxIndex()) aktualniIndex++;
                else if (rozdil < 0 && aktualniIndex > 0) aktualniIndex--;
                aktualizujCarousel();
            }
        });

        
        window.addEventListener('resize', () => {
            viditelnych = pocetViditelnych();
            aktualniIndex = Math.min(aktualniIndex, maxIndex());
            vytvorTecky();
            aktualizujCarousel();
        });

        vytvorTecky();
        aktualizujCarousel();
    });

    const faqPolozky = document.querySelectorAll('.faq__item');

    faqPolozky.forEach(polozka => {
        const otazka = polozka.querySelector('.faq__question');
        const odpoved = polozka.querySelector('.faq__answer');

        otazka?.addEventListener('click', () => {
            const jeOtevren = polozka.classList.toggle('open');

            
            if (jeOtevren) {
                odpoved.style.maxHeight = odpoved.scrollHeight + 'px';

                
                faqPolozky.forEach(jiny => {
                    if (jiny !== polozka && jiny.classList.contains('open')) {
                        jiny.classList.remove('open');
                        jiny.querySelector('.faq__answer').style.maxHeight = '0';
                    }
                });
            } else {
                odpoved.style.maxHeight = '0';
            }
        });
    });

    

    const form    = document.getElementById('rezervace-form');
    const zprava  = document.getElementById('form-zprava');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.form__submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Odesílám...';

        
        zprava.className = 'form__message';
        zprava.style.display = 'none';

        try {
            const formData = new FormData(form);
            const odpoved  = await fetch('php/rezervace.php', {
                method: 'POST',
                body: formData,
            });

            const data = await odpoved.json();

            zprava.textContent = data.zprava;
            zprava.classList.add(data.uspech ? 'success' : 'error');

            if (data.uspech) {
                form.reset();
            }

        } catch (chyba) {
            console.error('Chyba odesílání:', chyba);
            zprava.textContent = 'Nastala neočekávaná chyba. Zkuste to prosím znovu.';
            zprava.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Odeslat rezervaci';

            
            zprava.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

  
    function inicializujReveal() {
        const revealElemety = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver(
            (zaznamy) => {
                zaznamy.forEach(zaznam => {
                    if (zaznam.isIntersecting) {
                        zaznam.target.classList.add('visible');
                        observer.unobserve(zaznam.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        revealElemety.forEach(el => observer.observe(el));
    }

    inicializujReveal();

}); 
