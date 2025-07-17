` tags, ensuring all necessary parts are included and the original structure is preserved.

```
reasoning: The edited README provides an updated project description, expands on the backend architecture with OOP principles, and includes information regarding VS Code development. I'll merge these updates into the original README while keeping the original formatting and structure.
reasoning: The edited README has a different structure, so I will replace the entire content of the original README with the content of the edited README.

# 🌟 The Zodiac Prophecy
```

```
# 🌟 The Zodiac Prophecy

A modern, interactive zodiac consultation website with celestial themes, smooth animations, and a powerful Java backend using Object-Oriented Programming principles.

## ✨ Features

### Frontend
- **Futuristic UI/UX**: Celestial-themed design with smooth animations
- **Interactive Background**: Clickable celestial particles with cosmic effects
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Prophecy Generation**: Daily changing predictions
- **Copy Functionality**: Share your complete prophecy
- **Category Navigation**: Explore Love, Career, Health, and Wealth aspects
- **Cosmic Energy Indicators**: Real-time energy levels and percentages

### Backend (Pure Java OOP)
- **Object-Oriented Architecture**: Abstract classes, inheritance, polymorphism, interfaces
- **Service Layer Pattern**: Separation of concerns with dedicated services
- **Database Abstraction**: Interface-based data management
- **RESTful API**: Full backend support for all operations
- **Transaction Management**: Proper data handling and validation
- **CORS Support**: Cross-origin requests enabled
- **Admin Dashboard**: Comprehensive management interface
- **Export Features**: CSV and JSON data export
- **Real-time Statistics**: User demographics and consultation tracking

## 🚀 Getting Started

### Prerequisites
- Java 11 or higher
- Modern web browser
- Port 5000 available

### Installation & Running

#### For VS Code Development
1. **Clone/Download** the project to your local machine
2. **Open** the project folder in VS Code
3. **Install Java Extension Pack** in VS Code if not already installed

#### Running the Application

1. **Windows:**
   ```bash
   backend/compile_and_run.bat
   ```

2. **Linux/Mac:**
   ```bash
   chmod +x backend/compile_and_run.sh
   ./backend/compile_and_run.sh
   ```

3. **Manual:**
   ```bash
   cd backend
   javac ZodiacServer.java
   java ZodiacServer
   ```

4. **From VS Code Terminal:**
   ```bash
   cd backend
   javac ZodiacServer.java
   java ZodiacServer
   ```

### Access Points
- **Main Application**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin.html (Password: Rokeben123)

## 🏗️ Architecture

### Object-Oriented Design Patterns Used
- **Abstract Classes**: BaseService, BaseHandler
- **Interfaces**: DatabaseManager
- **Inheritance**: Service classes extend BaseService
- **Polymorphism**: Different handler implementations
- **Encapsulation**: Proper getter/setter methods
- **Single Responsibility**: Each class has one purpose
- **Dependency Injection**: Services injected into handlers

### Backend Structure
```
Services/
├── UserService (User management)
├── AdminService (Admin operations)
├── ProphecyService (Prophecy generation)
└── BaseService (Abstract base class)

Handlers/
├── UserHandler (API endpoints)
├── AdminHandler (Admin endpoints)
├── ConsultationHandler (Consultation endpoints)
├── ProphecyHandler (Prophecy endpoints)
└── BaseHandler (Abstract base class)

Utils/
├── ValidationUtils (Input validation)
├── JsonParser (JSON processing)
├── DataExporter (Export functionality)
└── ZodiacCalculator (Zodiac calculations)
```

## 📁 Project Structure
```
zodiac-prophecy/
├── backend/
│   ├── ZodiacServer.java (Main server with OOP architecture)
│   ├── compile_and_run.bat (Windows runner)
│   └── compile_and_run.sh (Unix runner)
├── assets/
│   ├── logo.png
│   ├── pic.jpg
│   └── video.mp4
├── index.html (Main application)
├── admin.html (Admin panel)
├── script.js (Frontend logic)
├── style.css (Styling)
└── README.md
```

## 🔧 Development Setup for VS Code

1. **Java Extension Pack**: Install the Java Extension Pack from VS Code marketplace
2. **Live Server**: Install Live Server extension for frontend development
3. **Backend Development**: Use VS Code terminal to compile and run Java server
4. **Frontend Development**: Use Live Server or open index.html directly

## 🚀 Features Implementation

### Backend OOP Principles
- **Abstraction**: Abstract base classes define common behavior
- **Encapsulation**: Private fields with public getters/setters
- **Inheritance**: Service and handler hierarchies
- **Polymorphism**: Interface implementations and method overriding
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion

### Data Management
- **Interface-based**: DatabaseManager interface for flexibility
- **In-memory Storage**: Fast data access with ConcurrentHashMap
- **Thread-safe**: Synchronized collections for concurrent access
- **Export Capabilities**: CSV and JSON export functionality

## 📊 Admin Features
- Real-time user statistics
- Complete user data management
- Export functionality (CSV/JSON)
- Data clearing capabilities
- Secure access with password protection

## 🎨 UI/UX Features
- Consistent celestial theme
- Smooth animations and transitions
- Responsive design for all devices
- Interactive cosmic elements
- Professional typography with Orbitron and Exo 2 fonts

## 🔒 Security
- Input validation and sanitization
- SQL injection prevention (though using in-memory storage)
- CORS configuration
- Secure admin access

## 🌟 Future Enhancements
- Database integration (PostgreSQL/MySQL)
- User authentication system
- Real-time notifications
- Advanced prophecy algorithms
- Mobile app development