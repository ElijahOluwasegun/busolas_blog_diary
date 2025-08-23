// Wait until the entire HTML document is loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the HTML elements we need to interact with
    const audio = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const trackTitleEl = document.getElementById('track-title');
    const downloadBtn = document.getElementById('download-btn');

    const topicSelector = document.getElementById('topic-selector');
    const topicSelectorHeader = document.getElementById('topic-selector-header');
    const topicDropdownBtn = document.getElementById('topic-dropdown-btn');
    const topicList = document.getElementById('topic-list');
    const topicItems = document.querySelectorAll('#topic-list li');

    let isPlaying = false;

    // --- UTILITY FUNCTION ---
    // Formats time from seconds into a "MM:SS" string
    const formatTime = (time) => {
        if (isNaN(time)) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // --- PLAYER CORE FUNCTIONS ---
    const playAudio = () => {
        isPlaying = true;
        audio.play();
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    };

    const pauseAudio = () => {
        isPlaying = false;
        audio.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    };
    
    // Updates the slider's position and background color
    const updateSlider = () => {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            seekSlider.value = progress;
            seekSlider.style.background = `linear-gradient(to right, #374151 ${progress}%, #d1d5db ${progress}%)`;
        }
    };

    // --- EVENT LISTENERS FOR PLAYER ---
    playPauseBtn.addEventListener('click', togglePlayPause);

    // Update time and slider as the audio plays
    audio.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audio.currentTime);
        updateSlider();
    });

    // Set total duration once the audio metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
        seekSlider.value = 0;
        seekSlider.style.background = `linear-gradient(to right, #374151 0%, #d1d5db 0%)`;
    });

    // Allow the user to seek to a different part of the audio
    seekSlider.addEventListener('input', () => {
        if (audio.duration) {
            const seekTime = (seekSlider.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    });

    // Reset the player when the audio finishes
    audio.addEventListener('ended', () => {
        pauseAudio();
        audio.currentTime = 0;
    });

    // --- TOPIC SELECTION LOGIC (FIXED) ---
    const toggleTopicList = () => {
        // FIX: Toggling the 'show' class to match the CSS rule '.topic-list.show'
        topicList.classList.toggle('show');
        topicDropdownBtn.querySelector('svg').classList.toggle('rotate-180');
    };

    topicSelectorHeader.addEventListener('click', toggleTopicList);

    // Handle changing the audio track when a new topic is clicked
    topicItems.forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-src');
            const title = item.getAttribute('data-title');

            audio.src = src;
            trackTitleEl.textContent = title;
            downloadBtn.href = src;
            downloadBtn.setAttribute('download', `${title}.mp3`);
            
            pauseAudio();
            audio.load(); // Load the new audio source
            // Wait until the new track is ready, then play it automatically
            audio.addEventListener('canplaythrough', playAudio, { once: true });

            toggleTopicList(); // Close the dropdown
        });
    });
    
    // Close the dropdown if the user clicks anywhere else on the page
    document.addEventListener('click', (e) => {
        // FIX: Check if the click is outside the topic-selector container AND if the list is currently shown
        if (!topicSelector.contains(e.target) && topicList.classList.contains('show')) {
            toggleTopicList();
        }
    });
    
    // --- INITIALIZATION ---
    // Sets up the player with the first track in the list by default
    const initializePlayer = () => {
        const firstTopic = topicItems[0];
        if (firstTopic) {
            audio.src = firstTopic.getAttribute('data-src');
            trackTitleEl.textContent = firstTopic.getAttribute('data-title');
            downloadBtn.href = firstTopic.getAttribute('data-src');
            downloadBtn.setAttribute('download', `${firstTopic.getAttribute('data-title')}.mp3`);
        }
    };

    initializePlayer();
});
