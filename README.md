<<<<<<< HEAD
# Go Timer

A professional web-based timer application designed specifically for the ancient game of Go (Weiqi/Baduk). This application provides precise timing functionality with byoyomi (overtime) periods, user authentication, game history tracking, and a clean, modern interface.

## Features

- **Professional Timer Interface**: Clean, split-screen design with distinct white and black player sides
- **Byoyomi Support**: Configurable overtime periods for authentic Go timing
- **User Authentication**: Login system with guest mode support
- **Game History**: Track and review past games with detailed statistics
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Quick Presets**: Pre-configured timing settings for different game types
- **Move History Tracking**: Record and visualize game progression
- **Save Game Functionality**: Export game records for analysis

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **Styling**: Modern CSS with dark theme and responsive design
- **Authentication**: Session-based user management

## Project Structure

```
go-timer-fixed/
├── src/
│   ├── static/                 # Frontend assets
│   │   ├── index.html         # Landing page
│   │   ├── login.html         # User authentication page
│   │   ├── settings.html      # Game configuration and history
│   │   ├── timer.html         # Main timer interface
│   │   ├── style.css          # Complete styling definitions
│   │   ├── app.js             # Landing page functionality
│   │   ├── auth.js            # Authentication logic
│   │   ├── settings.js        # Settings page interactions
│   │   ├── timer.js           # Timer functionality
│   │   ├── timer_functions.js # Core timer utilities
│   │   └── favicon.ico        # Application icon
│   ├── models/                # Database models
│   │   ├── user.py           # User model and database setup
│   │   └── move_history.py   # Game history model
│   ├── routes/               # API endpoints
│   │   ├── auth.py          # Authentication routes
│   │   ├── user.py          # User management routes
│   │   ├── move_history.py  # Game history routes
│   │   └── save_game.py     # Game saving functionality
│   ├── database/            # Database storage
│   │   └── app.db          # SQLite database file
│   └── main.py             # Flask application entry point
├── requirements.txt        # Python dependencies
└── README.md              # This documentation
```

## File Descriptions

### Backend Files

#### `src/main.py`
The main Flask application entry point that configures the web server, database connections, and routing. This file:
- Initializes the Flask application with CORS support
- Configures SQLite database connection
- Registers all API blueprint routes
- Sets up static file serving for the frontend
- Handles 404 and 500 error responses
- Creates database tables on startup

#### `src/models/user.py`
Defines the User model for the SQLAlchemy ORM, managing user authentication and profiles. Features include:
- User registration and login functionality
- Password hashing for security
- Session management
- Guest user support
- Database initialization and configuration

#### `src/models/move_history.py`
Manages the game history data model, storing information about completed games. This includes:
- Game timing records
- Move sequences and timestamps
- Player information
- Game outcome tracking
- Statistical data for analysis

#### `src/routes/auth.py`
Handles all authentication-related API endpoints:
- User login and logout
- Session validation
- Guest user creation
- Password verification
- Authentication state management

#### `src/routes/user.py`
Manages user profile and account operations:
- User registration
- Profile updates
- Account settings
- User data retrieval

#### `src/routes/move_history.py`
Provides API endpoints for game history functionality:
- Saving completed games
- Retrieving game history
- Game statistics calculation
- Move sequence analysis

#### `src/routes/save_game.py`
Specialized endpoints for game saving and export:
- Game record formatting
- Export functionality
- Game data validation

### Frontend Files

#### `src/static/index.html`
The application landing page featuring:
- Clean, minimalist design with Go stone animations
- Application branding and introduction
- Automatic redirection to login/settings based on authentication state

#### `src/static/login.html`
User authentication interface providing:
- Username and password input fields
- Guest mode access option
- Registration link
- Error message display
- Responsive form design

#### `src/static/settings.html`
Comprehensive game configuration page including:
- Timer settings (main time, byoyomi periods)
- Quick preset buttons for common time controls
- Game history display with statistics
- User profile information
- Start game functionality

#### `src/static/timer.html`
The main timer interface featuring:
- Split-screen design with white and black player sides
- Large, readable timer displays
- Visual turn indicators
- Utility menu for game controls
- Move history modal
- Timeout handling

#### `src/static/style.css`
Complete CSS styling definitions providing:
- Modern dark theme with professional appearance
- Responsive design for all screen sizes
- Smooth animations and transitions
- Consistent typography and spacing
- Interactive element styling
- Modal and overlay designs

#### `src/static/app.js`
Landing page JavaScript functionality:
- Authentication state checking
- Automatic page redirection
- Initial application setup

#### `src/static/auth.js`
Authentication page logic handling:
- Login form submission
- Guest mode activation
- Registration functionality
- Error handling and display
- Session management

#### `src/static/settings.js`
Settings page interactivity including:
- Timer configuration updates
- Preset button functionality
- Game history loading
- User interface updates
- Game initialization

#### `src/static/timer.js`
Core timer functionality providing:
- Timer display and countdown
- Turn switching logic
- Byoyomi period management
- Game state tracking
- User interface updates

#### `src/static/timer_functions.js`
Utility functions for timer operations:
- Time formatting and display
- Timer calculation logic
- Game state management
- History tracking utilities

## Installation and Setup

### Prerequisites
- Python 3.11 or higher
- pip (Python package installer)

### Installation Steps

1. **Clone or extract the project**:
   ```bash
   cd go-timer-fixed
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python src/main.py
   ```

4. **Access the application**:
   Open your web browser and navigate to `http://localhost:5001`

### Dependencies

The application requires the following Python packages (specified in `requirements.txt`):

- `Flask==3.1.1` - Web framework for the backend API
- `Flask-SQLAlchemy==3.1.1` - Database ORM integration
- `flask-cors==6.0.0` - Cross-origin resource sharing support
- `SQLAlchemy==2.0.41` - Database toolkit and ORM
- `Werkzeug==3.1.3` - WSGI utility library
- `Jinja2==3.1.6` - Template engine
- `MarkupSafe==3.0.2` - String handling utilities
- `itsdangerous==2.2.0` - Cryptographic signing
- `click==8.2.1` - Command line interface utilities
- `blinker==1.9.0` - Signal/event system
- `greenlet==3.2.3` - Lightweight coroutines
- `typing_extensions==4.14.0` - Type hints support

## Usage Guide

### Getting Started

1. **Launch the Application**: Start the Flask server and navigate to the application URL
2. **Authentication**: Choose to login with an existing account or continue as a guest
3. **Configure Game Settings**: Set your preferred time controls on the settings page
4. **Start Playing**: Click "Start Game" to begin timing your Go match

### Timer Controls

- **Click Timer Sides**: Tap the white or black side to switch turns
- **Utility Menu**: Access game controls via the menu button (⋯)
- **Pause/Resume**: Temporarily stop the timer during breaks
- **Restart**: Begin a new game with the same settings
- **Save Game**: Export the current game record

### Time Control Options

The application supports various time control formats:

- **Main Time**: Primary thinking time for each player (1-180 minutes)
- **Byoyomi Time**: Overtime period duration (5-300 seconds)
- **Byoyomi Periods**: Number of overtime periods (1-10)

### Quick Presets

Pre-configured time controls for different game types:

- **Blitz**: 5 minutes + 10 seconds × 3 periods
- **Standard**: 10 minutes + 30 seconds × 3 periods  
- **Long**: 20 minutes + 60 seconds × 5 periods
- **Tournament**: 60 minutes + 30 seconds × 5 periods

## Development Notes

### Architecture

The application follows a clean separation between frontend and backend:

- **Frontend**: Pure HTML/CSS/JavaScript for maximum compatibility
- **Backend**: RESTful API design with Flask
- **Database**: SQLite for simplicity and portability
- **Authentication**: Session-based with guest support

### Key Features Implementation

#### Timer Logic
The timer system implements authentic Go timing rules:
- Main time countdown for initial thinking time
- Automatic transition to byoyomi periods
- Visual and audio indicators for time pressure
- Precise timing with JavaScript intervals

#### Responsive Design
The interface adapts to different screen sizes:
- Mobile-first CSS approach
- Touch-friendly interface elements
- Scalable typography and spacing
- Optimized layouts for portrait and landscape orientations

#### Data Persistence
Game data is stored efficiently:
- SQLite database for reliability
- Automatic schema creation
- Session-based user tracking
- Comprehensive game history storage

## Contributing

This project welcomes contributions for:
- Bug fixes and performance improvements
- Additional time control formats
- Enhanced game analysis features
- Internationalization support
- Mobile app development

## License

This project is open source and available under standard open source licensing terms.

## Support

For issues, questions, or feature requests, please refer to the project repository or contact the development team.

---

*Made with Manus - Professional AI-powered development*

=======
# Go-timer-website
A website that times Go games with option to save time used per move locally, allowing players to reflect deeper on their time usage distribution and thought process in game review.

website available https://go-timer-website.onrender.com/
>>>>>>> cf794470241971d69fc83b909cd1a6a85c4e031d
