import '../styles/modern-normalize.css'
import '../styles/style.css'
import '../styles/components/home.css'
import '../styles/components/portfolio.css'
import '../styles/components/reel.css'
import '../styles/components/about.css'
import '../styles/components/fullscreen-video.css'
import '../styles/components/navbar.css'
import '../styles/utils.css'

const sections = {
    home: document.querySelector('.home'),
    portfolio: document.querySelector('.portfolio'),
    reel: document.querySelector('.reel'),
    about: document.querySelector('.about')
}

const notHomeContainer = document.querySelector('.not-home');
const portfolioContainer = document.querySelector('.portfolio-container');
const navLinks = document.querySelectorAll('.navbar a, .home-list a');
const navbarSelection = document.querySelector('.navbar-selection');
const navbar = document.querySelector('.navbar');
const reelYears = document.querySelectorAll('.year');
const reelList = document.querySelector('.reel-list');

const pFullscreenVideoContainer = document.querySelector('.fullscreen-video-container.pt');
const pFullscreenVideo = document.querySelector('.fullscreen-video.pt');
const pFullscreenDesc = document.querySelector('.fullscreen-desc.pt');
const pFullscreenBack = document.querySelector('.fullscreen-back.pt');

const rFullscreenVideoContainer = document.querySelector('.fullscreen-video-container.rl');
const rFullscreenVideo = document.querySelector('.fullscreen-video.rl');
const rFullscreenDesc = document.querySelector('.fullscreen-desc.rl');
const rFullscreenBack = document.querySelector('.fullscreen-back.rl');

const label = document.querySelector('.label');
const copyright = document.querySelector('.copyright');
const socials = document.querySelector('.socials');

let videosReady = false;
let videos = [];
let imgToVideo = new Map();
let yearToVideo = new Map();

window.addEventListener('load', () => {
    document.body.setAttribute('data-loaded', 'true');
});

fetch(`/api/videos`)
.then(res => res.json())
.then(data => {
    if (!data.data || !Array.isArray(data.data)) {
        console.err('Unexpected Vimeo response format', data);
        return;
    }

    videos = parseVideos(data.data);
    videosReady = true;

    const links = document.querySelectorAll('.home-list a[href="#"]');
    links.forEach(link => link.classList.remove('disabled'));
})
.catch(err => console.error('Fetch error:', err));

navLinks.forEach(link => {
	link.addEventListener('click', (e) => {
		const target = link.dataset.target;
        if (!target || link.classList.contains('disabled')) return;

        e.preventDefault();
        navigateTo(target);
	});
    link.addEventListener('mouseenter', () => {
        const target = link.dataset.target;
        navbarSelection.style.opacity = '1';
        navbarSelection.innerHTML = target.toString();
    });
    link.addEventListener('mouseleave', () => {
        navbarSelection.style.opacity = '0';
    });
});

reelYears.forEach(link => {
    link.addEventListener('click', (e) => {
        const target = link.dataset.target;
        if (!target) return;
        e.preventDefault();
        const dict = yearToVideo.get(target);
        showFullscreenVideo(dict, rFullscreenVideo, rFullscreenVideoContainer, rFullscreenDesc, sections.reel);
    });
});

sections.portfolio.addEventListener('click', (e) => {
    const target = e.target.closest('.video-wrapper');
    if (target) {
        const dict = imgToVideo.get(target.children[0]);
        showFullscreenVideo(dict, pFullscreenVideo, pFullscreenVideoContainer, pFullscreenDesc, sections.portfolio);
    }
});

pFullscreenBack.addEventListener('click', () => {
    pFullscreenVideoContainer.classList.remove('active');
    label.classList.remove('blur');
    copyright.classList.remove('blur');
    navbar.classList.remove('blur');
    sections.portfolio.classList.remove('blur');

    setTimeout(() => {
        pFullscreenVideoContainer.style.visibility = 'hidden';
        pFullscreenVideo.src = '';
        document.body.style.overflow = '';
        pFullscreenDesc.textContent = '';
    }, 300);
});

rFullscreenBack.addEventListener('click', () => {
    rFullscreenVideoContainer.classList.remove('active');
    label.classList.remove('blur');
    copyright.classList.remove('blur');
    navbar.classList.remove('blur');
    sections.reel.classList.remove('blur');
    reelList.classList.remove('blur');

    setTimeout(() => {
        rFullscreenVideoContainer.style.visibility = 'hidden';
        rFullscreenVideo.src = '';
        document.body.style.overflow = '';
        rFullscreenDesc.textContent = '';
    }, 300);
});

function showFullscreenVideo(dict, fsv, fsvc, fsd, sect) {
    fsv.src = dict.iframe.src;
    fsvc.style.visibility = 'visible';
    fsvc.classList.add('active');
    label.classList.add('blur');
    copyright.classList.add('blur');
    navbar.classList.add('blur');
    sect.classList.add('blur');
    reelList.classList.add('blur');
    document.body.style.overflow = 'hidden';
    fsd.textContent = dict.videoDesc || 'something went wrong';
}

function navigateTo(targetKey) {
    const currentKey = getActiveSectionKey();
    if (currentKey === targetKey) return;

    const current = sections[currentKey];
    const next = sections[targetKey];

    if (!next) return;

    const transitions = {
        home: {
            out: animateHomeOut,
            in: animateHomeIn
        },
        portfolio: {
            out: animatePortfolioOut,
            in: animatePortfolioIn
        },
        reel: {
            out: animateReelOut,
            in: animateReelIn
        },
        about: {
            out: animateAboutOut,
            in: animateAboutIn
        }
    };

    transitions[currentKey]?.out?.(targetKey, () => {
        current.classList.remove('active');
        if (currentKey === 'portfolio') {
            portfolioContainer.classList.remove('active');
            sections.portfolio.innerHTML = '';
        }

        if (targetKey !== 'home') notHomeContainer.classList.add('active');
        else notHomeContainer.classList.remove('active');

        next.classList.add('active');
        transitions[targetKey]?.in?.();
    });
}

function getActiveSectionKey() {
    return Object.entries(sections).find(([_, el]) => el.classList.contains('active'))?.[0] || 'home';
}

function animateHomeIn() {
    const items = document.querySelectorAll('.home-list li');
    swipeUp(items);
}

function animateHomeOut(_, callback) {
    navbar.style.opacity = '1';
    const items = document.querySelectorAll('.home-list li');
    swipeDown(items);
    setTimeout(callback, items.length * 100 + 500);
}

function animatePortfolioIn() {
    if (!videosReady) return;
    portfolioContainer.classList.add('active');
    const container = sections.portfolio;
    container.innerHTML = '';
    videos.forEach(wrapper => {
        wrapper.classList.remove('visible');
        container.appendChild(wrapper);
    });
    requestAnimationFrame(() => {
        videos.forEach((wrapper, i) => {
            setTimeout(() => {
                wrapper.style.opacity = '1';
                wrapper.classList.add('visible');
            }, i * 100);
        });
    });
}

function animatePortfolioOut(target, callback) {
    navbar.style.opacity = target === 'home' ? '0' : '1';
    videos.forEach(wrapper => wrapper.style.opacity = '0');
    setTimeout(callback, 500);
}

function animateReelIn() {
    const items = document.querySelectorAll('.reel-list li');
    swipeUp(items);
}

function animateReelOut(target, callback) {
    navbar.style.opacity = target === 'home' ? '0' : '1';
    const items = document.querySelectorAll('.reel-list li');
    swipeDown(items);
    setTimeout(callback, 500);
}

function animateAboutIn() {
    const container = sections.about;
    container.style.opacity = '1';
    socials.style.opacity = '1';
}

function animateAboutOut(target, callback) {
    const container = sections.about;
    container.style.opacity = '0';
    navbar.style.opacity = target === 'home' ? '0' : '1';
    socials.style.opacity = '0';
    setTimeout(callback, 500);
}

function swipeUp(items) {
    items.forEach((item) => {
        item.style.transition = 'none';
        item.style.transform = 'translateY(100px)';
        item.style.opacity = '0';
    });
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            items.forEach((item, i) => {
                item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                item.style.transitionDelay = `${i * 100}ms`;
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
                setTimeout(() => item.style.removeProperty('transform'), i * 100 + 500);
            });
        });
    });
}

function swipeDown(items) {
    items.forEach((item, i) => {
        const delay = (items.length - i - 1) * 100;
        item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        item.style.transitionDelay = `${delay}ms`;
        item.style.transform = 'translateY(100px)';
        item.style.opacity = '0';
    });
}

function parseVideos(videoData) {
    const parsed = [];

    videoData.forEach(video => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(video.embed.html, 'text/html');
        const iframe = doc.querySelector('iframe');

        if (!iframe) return;

        const wrapper = document.createElement('div');
        wrapper.classList.add('video-wrapper');

        const description = document.createElement('p');
        description.textContent = video.name || 'No Title';
        description.classList.add('video-title');

        const sizes = video.pictures.sizes;
        const thumbnail = sizes?.[sizes.length - 1]?.link || '';
        const img = document.createElement('img');
        img.src = thumbnail;
        img.alt = video.name || 'Video thumbnail';
        img.classList.add('video-thumbnail');

        let year = '';
        video.tags.forEach(y => year = y.name);

        const videoDesc = video.description;
        if (year.length != 0)
            yearToVideo.set(year, {iframe, videoDesc});
        else
        {
            imgToVideo.set(img, {iframe, videoDesc});

            wrapper.appendChild(img);
            wrapper.appendChild(description);

            parsed.push(wrapper);
        }
    });

    return parsed;
}