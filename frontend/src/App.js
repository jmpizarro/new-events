import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [adminConfig, setAdminConfig] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchEvents();
    fetchSummary();
    if (adminToken) {
      setIsAdmin(true);
      fetchAdminConfig();
    }
  }, [adminToken]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/summaries/latest`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchAdminConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminConfig(data);
      }
    } catch (error) {
      console.error('Error fetching admin config:', error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminForm),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setIsAdmin(true);
        setCurrentView('admin');
        fetchAdminConfig();
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed');
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setCurrentView('home');
    setAdminConfig(null);
  };

  const updateAdminConfig = async (updatedConfig) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedConfig),
      });
      
      if (response.ok) {
        setAdminConfig(updatedConfig);
        alert('Configuration updated successfully');
      } else {
        alert('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Failed to update configuration');
    }
  };

  const generateEvents = async (startDate, endDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchEvents();
      } else {
        const error = await response.json();
        alert(`Failed to generate events: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error generating events:', error);
      alert('Failed to generate events');
    }
  };

  const generateSummary = async (startDate, endDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchSummary();
      } else {
        const error = await response.json();
        alert(`Failed to generate summary: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    }
  };

  // Calendar component
  const Calendar = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = day === currentDate.getDate() && currentMonth === currentDate.getMonth() && currentYear === currentDate.getFullYear();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <span className="day-number">{day}</span>
          {dayEvents.length > 0 && (
            <div className="event-dots">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="event-dot"></div>
              ))}
              {dayEvents.length > 3 && <span className="more-events">+{dayEvents.length - 3}</span>}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>{monthName} {currentYear}</h2>
        </div>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  // Event card component
  const EventCard = ({ event }) => (
    <div className="event-card" onClick={() => setSelectedEvent(event)}>
      <div className="event-image">
        <img src={event.imageUrl} alt={event.title} />
        <div className="event-date-badge">
          {new Date(event.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p className="event-location">
          <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {event.location.name}, {event.location.district}
        </p>
        <p className="event-description">{event.description}</p>
        <div className="event-source">
          <span>Source: {event.source.provider}</span>
        </div>
      </div>
    </div>
  );

  // Deck of cards component for multiple events on same day
  const EventDeck = ({ events }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentEvent = events[currentIndex];

    const nextEvent = () => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const prevEvent = () => {
      setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    return (
      <div className="event-deck-container">
        <div className="event-deck">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`event-card-deck ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateY(${(index - currentIndex) * 8}px) translateX(${(index - currentIndex) * 4}px)`,
                zIndex: events.length - Math.abs(index - currentIndex),
                opacity: Math.abs(index - currentIndex) > 2 ? 0 : 1,
              }}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="event-image">
                <img src={event.imageUrl} alt={event.title} />
                <div className="event-date-badge">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-location">
                  <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {event.location.name}, {event.location.district}
                </p>
                <p className="event-description">{event.description}</p>
                <div className="event-source">
                  <span>Source: {event.source.provider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {events.length > 1 && (
          <div className="deck-navigation">
            <button className="nav-arrow nav-arrow-left" onClick={prevEvent}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <div className="deck-counter">
              <span>{currentIndex + 1} / {events.length}</span>
            </div>
            <button className="nav-arrow nav-arrow-right" onClick={nextEvent}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Event detail modal
  const EventDetailModal = ({ event, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <img src={event.imageUrl} alt={event.title} className="modal-image" />
        <div className="modal-body">
          <h2>{event.title}</h2>
          <div className="event-details">
            <div className="detail-item">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="detail-item">
              <strong>Location:</strong> {event.location.name}
            </div>
            <div className="detail-item">
              <strong>Address:</strong> {event.location.address}
            </div>
            <div className="detail-item">
              <strong>District:</strong> {event.location.district}
            </div>
          </div>
          <p className="event-description">{event.description}</p>
          <div className="event-source">
            <a href={event.source.url} target="_blank" rel="noopener noreferrer">
              View on {event.source.provider}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin panel component
  const AdminPanel = () => {
    const [configForm, setConfigForm] = useState(adminConfig || {});
    const [generateForm, setGenerateForm] = useState({
      start_date: '2025-07-01',
      end_date: '2025-07-31'
    });

    const handleConfigSubmit = (e) => {
      e.preventDefault();
      updateAdminConfig(configForm);
    };

    const handleGenerateEvents = (e) => {
      e.preventDefault();
      generateEvents(generateForm.start_date, generateForm.end_date);
    };

    const handleGenerateSummary = (e) => {
      e.preventDefault();
      generateSummary(generateForm.start_date, generateForm.end_date);
    };

    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button onClick={handleAdminLogout} className="logout-btn">Logout</button>
        </div>
        
        <div className="admin-section">
          <h3>Configuration</h3>
          <form onSubmit={handleConfigSubmit} className="config-form">
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                value={configForm.city || ''}
                onChange={(e) => setConfigForm({...configForm, city: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>OpenAI API Key:</label>
              <input
                type="password"
                value={configForm.openai_api_key || ''}
                onChange={(e) => setConfigForm({...configForm, openai_api_key: e.target.value})}
                placeholder="Enter your OpenAI API key"
              />
            </div>
            <div className="form-group">
              <label>Categories:</label>
              <input
                type="text"
                value={configForm.categories?.join(', ') || ''}
                onChange={(e) => setConfigForm({...configForm, categories: e.target.value.split(', ')})}
              />
            </div>
            <button type="submit" className="submit-btn">Update Configuration</button>
          </form>
        </div>

        <div className="admin-section">
          <h3>Generate Content</h3>
          <form className="generate-form">
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={generateForm.start_date}
                onChange={(e) => setGenerateForm({...generateForm, start_date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={generateForm.end_date}
                onChange={(e) => setGenerateForm({...generateForm, end_date: e.target.value})}
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={handleGenerateEvents} className="generate-btn">
                Generate Events
              </button>
              <button type="button" onClick={handleGenerateSummary} className="generate-btn">
                Generate Summary
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Login form
  const LoginForm = () => (
    <div className="login-container">
      <div className="login-form">
        <h2>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={adminForm.username}
              onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Valencia Events</h1>
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <nav className="nav-menu">
              <button
                className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                Home
              </button>
              <button
                className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button
                className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                {isAdmin ? 'Admin' : 'Login'}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'home' && (
          <div className="home-view">
            <div className="hero-section">
              <div className="hero-content">
                <h2>Discover Valencia's Cultural Heart</h2>
                <p>Experience the authentic events that make Valencia unique</p>
              </div>
              <div className="hero-image">
                <img src="https://images.unsplash.com/photo-1658329717628-4c051a4c6820?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxWYWxlbmNpYSUyMGNpdHlzY2FwZXxlbnwwfHx8Ymx1ZXwxNzUyNDMwMDU0fDA&ixlib=rb-4.1.0&q=85" alt="Valencia cityscape" />
              </div>
            </div>

            {summary && (
              <div className="summary-section">
                <h3>This Week in Valencia</h3>
                <p>{summary.summary}</p>
                <div className="summary-meta">
                  <span>{summary.start_date} - {summary.end_date}</span>
                  <div className="event-types">
                    {summary.event_types.map(type => (
                      <span key={type} className="event-type-tag">{type}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="events-section">
              <h3>Upcoming Events</h3>
              {loading ? (
                <div className="loading">Loading events...</div>
              ) : (
                <div className="events-grid">
                  {events.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="calendar-view">
            <Calendar />
            {selectedDate && (
              <div className="selected-date-events">
                <h3>Events on {new Date(selectedDate).toLocaleDateString()}</h3>
                <div className="events-list">
                  {events.filter(event => event.date === selectedDate).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'admin' && (
          isAdmin ? <AdminPanel /> : <LoginForm />
        )}
      </main>

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

export default App;