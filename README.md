# Go Timer

A professional web-based timer application designed specifically for the ancient game of Go (Weiqi/Baduk). This application provides precise timing functionality with byoyomi (overtime) periods, user authentication, game history tracking, and a clean, modern interface.

## Features

- **Byoyomi Support**: Configurable overtime periods for authentic Go timing
- **Move History Tracking**: Record and visualize game progression
- **Game History**: Track and review past games with detailed time statistics
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

