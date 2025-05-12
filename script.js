// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSbonwVE3PPXIIrSrvrB75u2AQ_B_Tni4",
    authDomain: "discraft-c1c41.firebaseapp.com",
    databaseURL: "https://discraft-c1c41-default-rtdb.firebaseio.com",
    projectId: "discraft-c1c41",
    storageBucket: "discraft-c1c41.appspot.com",
    messagingSenderId: "525620150766",
    appId: "1:525620150766:web:a426e68d206c68764aceff",
    measurementId: "G-2TRNRYRX5E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const nameSelect = document.getElementById('nameSelect');
const colorOptions = document.getElementById('colorOptions');
const selectedCountElement = document.getElementById('selectedCount');
const submitButton = document.getElementById('submitVote');
const messageBox = document.getElementById('messageBox');
const votesContainer = document.getElementById('votesContainer');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const searchVotes = document.getElementById('searchVotes');
const sortVotes = document.getElementById('sortVotes');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Constants
const MAX_SELECTIONS = 3;
let selectedCount = 0;
let colorCheckboxes = [];
let allVotes = [];
let colorVoteCounts = {};
let totalVoteCount = 0;
const NON_VOTABLE_COLORS = [3, 6, 17, 23, 25, 26]; // Colors that can't be voted for
let mostPickedColor = null;
let topThreeColors = []; // Track the top three most voted colors

// Tab switching logic
function initTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabName) {
                    content.classList.add('active');
                    
                    // Load data for the tab if needed
                    if (tabName === 'results' && votesContainer.children.length <= 1) {
                        loadVotes();
                    } else if (tabName === 'leaderboard' && leaderboardContainer.children.length <= 1) {
                        loadLeaderboard();
                    }
                }
            });
        });
    });
}

// Load color images from the images folder
async function loadColorImages() {
    try {
        // Clear existing options
        colorOptions.innerHTML = '';
        
        // Get a list of available image files (we'll simulate this since we can't directly read the directory)
        // Instead, we'll look for files named 1.png, 2.png, 3.png, etc. up to 45
        const MAX_IMAGES = 45;
        
        for (let i = 1; i <= MAX_IMAGES; i++) {
            // Create a color option element
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.dataset.colorId = i;
            
            // Check if this color is not votable
            const isNonVotable = NON_VOTABLE_COLORS.includes(i);
            if (isNonVotable) {
                colorOption.classList.add('non-votable');
            }
            
            // Create a label for better UX
            const label = document.createElement('label');
            label.className = 'color-label';
            label.setAttribute('for', `color${i}`);
            
            // Create the checkbox input
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `color${i}`;
            checkbox.name = 'colorVote';
            checkbox.value = `Color ${i}`;
            checkbox.dataset.colorId = i;
            
            // Disable checkbox for non-votable colors
            if (isNonVotable) {
                checkbox.disabled = true;
                
                // Add click handler for the label to show message
                label.addEventListener('click', (e) => {
                    e.preventDefault();
                    showMessage('This color has been chosen by other Swayam teams and is not available for voting.', 'warning');
                    return false;
                });
            } else {
                checkbox.addEventListener('change', handleColorSelection);
            }
            
            // Create the image element
            const img = document.createElement('img');
            img.src = `images/${i}.png`;
            img.alt = `Color ${i}`;
            
            // Handle missing images
            img.onerror = function() {
                // If the image doesn't exist, remove this option
                colorOption.remove();
            };
            
            // Add elements to the DOM
            label.appendChild(checkbox);
            label.appendChild(img);
            
            // Add color ID badge for better identification
            const colorIdBadge = document.createElement('div');
            colorIdBadge.className = 'color-id-badge';
            colorIdBadge.textContent = `#${i}`;
            label.appendChild(colorIdBadge);
            
            // Add "Not Available" text for non-votable colors
            if (isNonVotable) {
                const notAvailableTag = document.createElement('div');
                notAvailableTag.className = 'not-available-tag';
                notAvailableTag.textContent = 'Not Available';
                label.appendChild(notAvailableTag);
            }
            
            colorOption.appendChild(label);
            colorOptions.appendChild(colorOption);
            
            // Add to our checkboxes collection if it's votable
            if (!isNonVotable) {
                colorCheckboxes.push(checkbox);
            }
        }
    } catch (error) {
        console.error('Error loading color images:', error);
        showMessage('Failed to load color options. Please refresh the page.', 'error');
    }
}

// Check if user has already voted
function checkIfVoted() {
    const hasVoted = localStorage.getItem('hasVoted');
    if (hasVoted) {
        disableVoting();
        showMessage('You have already voted. Thank you for participating!', 'warning');
        return true;
    }
    return false;
}

// Disable the voting form
function disableVoting() {
    nameSelect.disabled = true;
    colorCheckboxes.forEach(checkbox => {
        checkbox.disabled = true;
    });
    submitButton.disabled = true;
}

// Enable submit button if conditions are met
function updateSubmitButton() {
    const nameSelected = nameSelect.value !== '';
    const colorsSelected = selectedCount === MAX_SELECTIONS;
    
    submitButton.disabled = !(nameSelected && colorsSelected);
}

// Update the selected count display
function updateSelectedCount() {
    selectedCountElement.textContent = selectedCount;
    updateSubmitButton();
}

// Handle color selection logic
function handleColorSelection(event) {
    const checkbox = event.target;
    const colorOption = checkbox.closest('.color-option');
    
    if (checkbox.checked) {
        // Check if max selections reached
        if (selectedCount >= MAX_SELECTIONS) {
            checkbox.checked = false;
            showMessage(`You can only select ${MAX_SELECTIONS} colors.`, 'error');
            return;
        }
        
        // Increment count and update UI
        selectedCount++;
        colorOption.classList.add('selected');
    } else {
        // Decrement count and update UI
        selectedCount--;
        colorOption.classList.remove('selected');
    }
    
    updateSelectedCount();
}

// Show message to the user
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = 'message-box';
    messageBox.classList.add(type);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
}

// Submit vote to Firebase
function submitVote() {
    if (checkIfVoted()) return;
    
    const name = nameSelect.value;
    if (!name) {
        showMessage('Please select your name.', 'error');
        return;
    }
    
    // Get selected colors
    const selectedColors = [];
    colorCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedColors.push({
                id: checkbox.dataset.colorId,
                name: `Color #${checkbox.dataset.colorId}`
            });
        }
    });
    
    if (selectedColors.length !== MAX_SELECTIONS) {
        showMessage(`Please select exactly ${MAX_SELECTIONS} colors.`, 'error');
        return;
    }
    
    // Create vote data object
    const voteData = {
        name: name,
        colors: selectedColors,
        timestamp: new Date().toISOString()
    };
    
    // Create a new entry in the database
    const voteRef = database.ref('votes').push();
    
    voteRef.set(voteData)
        .then(() => {
            // Mark as voted in localStorage
            localStorage.setItem('hasVoted', 'true');
            localStorage.setItem('voterName', name);
            
            showMessage('Thank you for voting!', 'success');
            disableVoting();
            
            // Update leaderboard and results
            loadVotes();
            loadLeaderboard();
        })
        .catch(error => {
            showMessage(`Error submitting vote: ${error.message}`, 'error');
        });
}

// Check if name has already voted
function checkNameVoted(name) {
    return new Promise((resolve, reject) => {
        database.ref('votes')
            .orderByChild('name')
            .equalTo(name)
            .once('value')
            .then(snapshot => {
                resolve(snapshot.exists());
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Load all votes from Firebase
function loadVotes() {
    const loadingElement = document.getElementById('votesLoading');
    loadingElement.style.display = 'flex';
    
    database.ref('votes')
        .once('value')
        .then(snapshot => {
            // Clear existing votes
            allVotes = [];
            votesContainer.innerHTML = '';
            
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const voteData = childSnapshot.val();
                    voteData.id = childSnapshot.key;
                    allVotes.push(voteData);
                });
                
                // Sort votes by default (newest first)
                sortVotes.value = 'newest';
                sortVotesList('newest');
                
                // Display votes
                displayVotes(allVotes);
            } else {
                votesContainer.innerHTML = '<div class="no-data">No votes yet. Be the first to vote!</div>';
            }
            
            loadingElement.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading votes:', error);
            votesContainer.innerHTML = '<div class="error-message">Error loading votes. Please try again later.</div>';
            loadingElement.style.display = 'none';
        });
}

// Display votes in the votes container
function displayVotes(votes) {
    votesContainer.innerHTML = '';
    
    if (votes.length === 0) {
        votesContainer.innerHTML = '<div class="no-data">No matching votes found.</div>';
        return;
    }
    
    votes.forEach(vote => {
        const voteCard = document.createElement('div');
        voteCard.className = 'vote-card';
        
        const voteDate = new Date(vote.timestamp);
        const formattedDate = voteDate.toLocaleString();
        
        // Create vote header with name and date
        const voteHeader = document.createElement('div');
        voteHeader.className = 'vote-header';
        voteHeader.innerHTML = `
            <div class="voter-name">${vote.name}</div>
            <div class="vote-date">${formattedDate}</div>
        `;
        
        // Create colors container
        const voteColors = document.createElement('div');
        voteColors.className = 'vote-colors';
        
        // Add each color
        vote.colors.forEach(color => {
            const colorElement = document.createElement('div');
            colorElement.className = 'vote-color';
            
            const colorImg = document.createElement('img');
            colorImg.src = `images/${color.id}.png`;
            colorImg.alt = `Color #${color.id}`;
            colorImg.onerror = () => {
                colorImg.src = 'https://via.placeholder.com/30?text=?';
            };
            
            colorElement.appendChild(colorImg);
            colorElement.appendChild(document.createTextNode(`Color #${color.id}`));
            voteColors.appendChild(colorElement);
        });
        
        // Assemble vote card
        voteCard.appendChild(voteHeader);
        voteCard.appendChild(voteColors);
        votesContainer.appendChild(voteCard);
    });
}

// Sort votes based on criteria
function sortVotesList(criteria) {
    switch (criteria) {
        case 'newest':
            allVotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'oldest':
            allVotes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'name':
            allVotes.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            allVotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

// Filter votes by search term
function filterVotes(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return allVotes;
    }
    
    searchTerm = searchTerm.toLowerCase().trim();
    return allVotes.filter(vote => 
        vote.name.toLowerCase().includes(searchTerm)
    );
}

// Load leaderboard data from Firebase
function loadLeaderboard() {
    const loadingElement = document.getElementById('leaderboardLoading');
    loadingElement.style.display = 'flex';
    
    database.ref('votes')
        .once('value')
        .then(snapshot => {
            // Reset color vote counts
            colorVoteCounts = {};
            totalVoteCount = 0;
            
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const voteData = childSnapshot.val();
                    
                    // Count votes for each color
                    voteData.colors.forEach(color => {
                        const colorId = color.id;
                        if (!colorVoteCounts[colorId]) {
                            colorVoteCounts[colorId] = {
                                id: colorId,
                                name: `Color #${colorId}`,
                                count: 0
                            };
                        }
                        colorVoteCounts[colorId].count++;
                        totalVoteCount++;
                    });
                });
                
                // Store the top three colors
                const colorArray = Object.values(colorVoteCounts);
                colorArray.sort((a, b) => b.count - a.count);
                topThreeColors = colorArray.slice(0, 3);
                
                displayLeaderboard();
                displayMostPickedColor();
                
                // Highlight top colors in the voting section
                highlightTopColors();
            } else {
                leaderboardContainer.innerHTML = '<div class="no-data">No votes yet. Be the first to vote!</div>';
                // Hide the most picked color section if there are no votes
                const mostPickedContainer = document.getElementById('mostPickedColorContainer');
                if (mostPickedContainer) {
                    mostPickedContainer.style.display = 'none';
                }
            }
            
            loadingElement.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading leaderboard:', error);
            leaderboardContainer.innerHTML = '<div class="error-message">Error loading leaderboard. Please try again later.</div>';
            loadingElement.style.display = 'none';
        });
}

// Highlight top colors in the voting section
function highlightTopColors() {
    // First, remove any existing highlights
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('top-color', 'first-place', 'second-place', 'third-place');
    });
    
    // Add highlights for top colors
    topThreeColors.forEach((color, index) => {
        const colorOption = document.querySelector(`.color-option[data-color-id="${color.id}"]`);
        if (colorOption) {
            colorOption.classList.add('top-color');
            
            // Add specific place class
            if (index === 0) {
                colorOption.classList.add('first-place');
            } else if (index === 1) {
                colorOption.classList.add('second-place');
            } else if (index === 2) {
                colorOption.classList.add('third-place');
            }
            
            // Add a badge for top 3
            const existingBadge = colorOption.querySelector('.top-badge');
            if (!existingBadge) {
                const badge = document.createElement('div');
                badge.className = 'top-badge';
                badge.textContent = `#${index + 1}`;
                colorOption.appendChild(badge);
            }
        }
    });
}

// Display the most picked color
function displayMostPickedColor() {
    // Get the most picked color container
    const mostPickedContainer = document.getElementById('mostPickedColorContainer');
    if (!mostPickedContainer) return;
    
    // Make it visible
    mostPickedContainer.style.display = 'block';
    
    // Get most picked color
    const colorArray = Object.values(colorVoteCounts);
    if (colorArray.length === 0) {
        mostPickedContainer.innerHTML = '<div class="no-data">No votes yet.</div>';
        return;
    }
    
    // Sort by count (descending)
    colorArray.sort((a, b) => b.count - a.count);
    mostPickedColor = colorArray[0];
    
    // Display the most picked color
    const percentage = totalVoteCount > 0 ? Math.round((mostPickedColor.count / totalVoteCount) * 100) : 0;
    
    const mostPickedContent = document.getElementById('mostPickedColorContent');
    mostPickedContent.innerHTML = `
        <div class="most-picked-color-image">
            <img src="images/${mostPickedColor.id}.png" alt="${mostPickedColor.name}">
            <div class="most-picked-color-id">#${mostPickedColor.id}</div>
        </div>
        <div class="most-picked-color-details">
            <div class="most-picked-color-name">${mostPickedColor.name}</div>
            <div class="most-picked-color-votes">${mostPickedColor.count} votes (${percentage}%)</div>
            <div class="most-picked-color-progress">
                <div class="most-picked-color-progress-bar" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
    
    // Also show top 3 if we have enough votes
    if (colorArray.length >= 3) {
        const topColorsSection = document.createElement('div');
        topColorsSection.className = 'top-colors-section';
        topColorsSection.innerHTML = '<h3>Top 3 Colors</h3>';
        
        const topColorsContainer = document.createElement('div');
        topColorsContainer.className = 'top-colors-container';
        
        for (let i = 0; i < Math.min(3, colorArray.length); i++) {
            const color = colorArray[i];
            const colorPercentage = totalVoteCount > 0 ? Math.round((color.count / totalVoteCount) * 100) : 0;
            
            const topColorItem = document.createElement('div');
            topColorItem.className = `top-color-item top-${i+1}`;
            
            topColorItem.innerHTML = `
                <div class="top-color-rank">#${i+1}</div>
                <div class="top-color-image">
                    <img src="images/${color.id}.png" alt="${color.name}">
                </div>
                <div class="top-color-info">
                    <div class="top-color-id">Color #${color.id}</div>
                    <div class="top-color-votes">${color.count} votes (${colorPercentage}%)</div>
                </div>
            `;
            
            topColorsContainer.appendChild(topColorItem);
        }
        
        topColorsSection.appendChild(topColorsContainer);
        mostPickedContainer.appendChild(topColorsSection);
    }
}

// Display leaderboard data
function displayLeaderboard() {
    leaderboardContainer.innerHTML = '';
    
    // Convert to array and sort by vote count
    const colorArray = Object.values(colorVoteCounts);
    colorArray.sort((a, b) => b.count - a.count);
    
    // Display top colors
    colorArray.forEach((color, index) => {
        const percentage = totalVoteCount > 0 ? Math.round((color.count / totalVoteCount) * 100) : 0;
        
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        if (index < 3) {
            leaderboardItem.classList.add(`top-${index+1}-color`);
        }
        
        const rankElement = document.createElement('div');
        rankElement.className = 'leaderboard-rank';
        rankElement.textContent = index + 1;
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'leaderboard-image';
        
        const imageElement = document.createElement('img');
        imageElement.src = `images/${color.id}.png`;
        imageElement.alt = color.name;
        imageElement.onerror = () => {
            imageElement.src = 'https://via.placeholder.com/150?text=?';
        };
        
        const colorIdElement = document.createElement('div');
        colorIdElement.className = 'leaderboard-color-id';
        colorIdElement.textContent = `#${color.id}`;
        
        const detailsElement = document.createElement('div');
        detailsElement.className = 'leaderboard-details';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'leaderboard-color-name';
        nameElement.textContent = color.name;
        
        const votesElement = document.createElement('div');
        votesElement.className = 'leaderboard-votes';
        votesElement.textContent = `${color.count} votes (${percentage}%)`;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'leaderboard-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'leaderboard-progress-bar';
        progressBar.style.width = `${percentage}%`;
        
        // Assemble elements
        progressContainer.appendChild(progressBar);
        detailsElement.appendChild(nameElement);
        detailsElement.appendChild(votesElement);
        detailsElement.appendChild(progressContainer);
        
        imageContainer.appendChild(imageElement);
        imageContainer.appendChild(colorIdElement);
        
        leaderboardItem.appendChild(rankElement);
        leaderboardItem.appendChild(imageContainer);
        leaderboardItem.appendChild(detailsElement);
        
        leaderboardContainer.appendChild(leaderboardItem);
    });
    
    if (colorArray.length === 0) {
        leaderboardContainer.innerHTML = '<div class="no-data">No votes yet. Be the first to vote!</div>';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    initTabs();
    
    // Load color images
    loadColorImages();
    
    // Check if user already voted
    checkIfVoted();
    
    // Add event listener to name select
    nameSelect.addEventListener('change', async () => {
        const selectedName = nameSelect.value;
        
        if (selectedName) {
            try {
                const hasVoted = await checkNameVoted(selectedName);
                
                if (hasVoted) {
                    showMessage(`${selectedName} has already voted. Please keep it fair!`, 'warning');
                    nameSelect.value = '';
                }
                
                updateSubmitButton();
            } catch (error) {
                showMessage(`Error checking voter status: ${error.message}`, 'error');
            }
        }
    });
    
    // Add event listener to submit button
    submitButton.addEventListener('click', submitVote);
    
    // Add event listeners for results filtering and sorting
    if (searchVotes) {
        searchVotes.addEventListener('input', () => {
            const filteredVotes = filterVotes(searchVotes.value);
            displayVotes(filteredVotes);
        });
    }
    
    if (sortVotes) {
        sortVotes.addEventListener('change', () => {
            sortVotesList(sortVotes.value);
            const filteredVotes = filterVotes(searchVotes.value);
            displayVotes(filteredVotes);
        });
    }
    
    // Initial button state
    updateSubmitButton();
}); 