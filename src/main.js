import '../styles/modern-normalize.css'
import '../styles/style.css'
import '../styles/components/home.css'
import '../styles/components/portfolio.css'
import '../styles/components/reel.css'
import '../styles/components/about.css'
import '../styles/utils.css'

const sections = {
    home: document.querySelector('.home'),
    portfolio: document.querySelector('.portfolio'),
    reel: document.querySelector('.reel'),
    about: document.querySelector('.about')
}

const portfolioContainer = document.querySelector('.portfolio-container');
const navLinks = document.querySelectorAll('.home-list a, .navbar a');
const navbarSelection = document.querySelector('.navbar-selection');
const navbar = document.querySelector('.navbar');
let videoWrappers = sections.portfolio.childNodes;

let videosReady = false;
let videos = [];

window.addEventListener('load', () => {
    document.body.setAttribute('data-loaded', 'true');
});

fetch(`http://localhost:3000/api`)
.then(res => res.json())
.then(data => {

    if (!data.data || !Array.isArray(data.data)) {
        console.err('Unexpected Vimeo response format', data);
        return;
    }

    videos = parseVideos(data.data);
    videosReady = true;

    const portfolioLink = document.querySelector('.home-list a[href="#"]');
    if (portfolioLink) portfolioLink.classList.remove('disabled');
})
.catch(err => console.error('Fetch error:', err));

navLinks.forEach(link => {
	link.addEventListener('click', (e) => {
		const target = link.dataset.target;
        if (!target) return;

        e.preventDefault();
        handleNavigation(target);
	});
    link.addEventListener('mouseenter', (e) => {
        const target = link.dataset.target;
        if (!target) return;

        e.preventDefault();
        navbarSelection.style.opacity = '1';
        navbarSelection.innerHTML = target.toString();
    });
    link.addEventListener('mouseleave', (e) => {
        const target = link.dataset.target;
        if (!target) return;

        e.preventDefault();
        navbarSelection.style.opacity = '0';
    });
});

sections.portfolio.addEventListener('click', function(e) {
    const target = e.target.closest('.video-wrapper');
    if (target)
        console.log('video clicked');
    console.log('click');
});

function handleNavigation(target) {
    const currentSection = getActiveSection();
    if (target === 'home') {
        if (currentSection && currentSection !== sections.home)
            transitionToHome(currentSection);
        return;
    }

    if (sections[target] && currentSection !== sections[target]) {
        if (currentSection === sections.home)
            transitionFromHome(() => activateSection(target));
        else {
            currentSection.classList.remove('active');
            activateSection(target);
        }
    }
}

function activateSection(key) {
    const section = sections[key];
    if (!section) return;

    section.classList.add('active');

    navbar.style.opacity = '1';

    if (key === 'portfolio' && videosReady) {
        portfolioContainer.classList.add('active');
        loadVideos();
    }
}

function getActiveSection() {
    return Object.values(sections).find(sec => sec.classList.contains('active'));
}

function transitionFromHome(callback) {
    const items = document.querySelectorAll('.home-list li');
    const count = items.length;

    items.forEach((item, index) => {
        const reverseIndex = count - index - 1;
        item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        item.style.transitionDelay = `${reverseIndex * 100}ms`;
		item.style.transform = 'translateY(100px)';
		item.style.opacity = '0';
    });

    setTimeout(() => {
        sections.home.classList.remove('active');
        callback();
    }, count * 100 + 500);
}

function transitionToHome(fromSection) {
    const items = document.querySelectorAll('.home-list li');

    navbar.style.opacity = '0';

	if (fromSection === sections.portfolio)
		videos.forEach(wrapper => wrapper.style.opacity = '0');

    setTimeout(() => {
        fromSection.classList.remove('active');

        if (fromSection === sections.portfolio) {
            fromSection.innerHTML = '';
            portfolioContainer.classList.remove('active');
            videos.forEach(wrapper => wrapper.classList.remove('visible'));
        }

        items.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = 'translateY(100px)';
            item.style.opacity = '0';
        });

        sections.home.classList.add('active');

        requestAnimationFrame(() => {
            items.forEach((item, index) => {
                item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                item.style.transitionDelay = `${index * 100}ms`;
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';

                setTimeout(() => {
                    item.style.removeProperty('transform');
                }, index * 100 + 500);
            });
        });
    }, 500);
}

function loadVideos() {
    const container = document.querySelector('.portfolio');
    container.innerHTML = '';

    videos.forEach(wrapper => {
        wrapper.classList.remove('visible');
        container.append(wrapper);
    });

    requestAnimationFrame(() => {
		videos.forEach((wrapper, index) => {
			setTimeout(() => {
                wrapper.style.opacity = '1';
				wrapper.classList.add('visible');
			}, index * 150);
		});
	});
}

function parseVideos(videoData) {
    const parsed = [];

    videoData.forEach(video => {
        for (let i = 0; i < 4; i++) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(video.embed.html, 'text/html');
            const iframe = doc.querySelector('iframe');

            if (!iframe) continue;

            const url = new URL(iframe.src);
            url.searchParams.set('autoplay', '0');
            url.searchParams.set('background', '1');
            iframe.src = url.toString();

            const wrapper = document.createElement('div');
            wrapper.classList.add('video-wrapper');

            const description = document.createElement('p');
            description.textContent = video.name || 'No Title';
            description.classList.add('video-title');

            wrapper.appendChild(iframe);
            wrapper.appendChild(description);

            parsed.push(wrapper);
        }
    });

    return parsed;
}