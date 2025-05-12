# Color Voting Application

A modern web application that allows users to vote for their favorite colors. Each user can select exactly three colors from up to 45 available options.

## Features

- **User identification** by name selection
- **Voting System** for selecting three colors from image options
- **Prevention of duplicate voting** (using both local storage and database validation)
- **Real-time tracking** of votes in a Firebase database
- **Interactive Leaderboard** showing the most popular colors
- **Vote History** with filtering and sorting options
- **Responsive design** that works on mobile and desktop devices

## Screenshots

(Screenshots will be available once the application is deployed)

## Setup and Usage

1. Clone this repository
2. Open `index.html` in a web browser
3. Navigate through the tabs to use different features:
   - **Vote**: Select your name and choose three colors
   - **Results**: View all submitted votes with filtering options
   - **Leaderboard**: See the ranking of all colors based on popularity

## Main Features Explained

### Voting System
- Select your name from the dropdown menu
- Browse through 45 different colors and select exactly three
- Submit your vote once selections are complete
- Each user can only vote once (verification by name and local storage)

### Results View
- See all votes submitted by users
- Search for votes by name
- Sort votes by newest, oldest, or alphabetically by name
- Each vote shows the voter's name, time of submission, and selected colors

### Leaderboard
- View the popularity of all colors
- Colors are ranked by the number of votes they received
- Visual progress bars show the percentage of votes for each color
- Real-time updates whenever new votes are submitted

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses Firebase Realtime Database to store votes
- Modern UI with responsive design using CSS Grid and Flexbox
- Prevents duplicate voting using both client-side (localStorage) and server-side (database) checks
- Dynamic loading of color images from the images folder

## Firebase Configuration

The application uses the following Firebase configuration:

```javascript
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
```

## Data Structure

Votes are stored in the Firebase Realtime Database with the following structure:

```
votes/
  - unique_vote_id_1/
    - name: "Voter Name"
    - colors: [
        { id: "1", name: "Color 1" },
        { id: "2", name: "Color 2" },
        { id: "3", name: "Color 3" }
      ]
    - timestamp: "2023-06-01T12:34:56.789Z"
  - unique_vote_id_2/
    ...
```

## Adding More Colors

To add more color options:
1. Add image files to the `images` folder using the naming pattern: `1.png`, `2.png`, etc.
2. The application will automatically detect and display all color images up to a maximum of 45

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Known Limitations

- Color images must be named in sequential order (1.png, 2.png, etc.)
- Maximum of 45 color options supported 