import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentView, setCurrentView] = useState('home');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [adminConfig, setAdminConfig] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8088';

  // Translations
  const translations = {
    en: {
      title: 'Valencia Events',
      home: 'Home',
      calendar: 'Calendar',
      login: 'Login',
      admin: 'Admin',
      discoverTitle: "Discover Valencia's Cultural Heart",
      discoverSubtitle: 'Experience the authentic events that make Valencia unique',
      thisWeek: 'This Week in Valencia',
      next7Days: 'Next 7 Days',
      upcomingEvents: 'Upcoming Events',
      loadingEvents: 'Loading events...',
      noEvents: 'No events scheduled',
      noEventsDay: 'No events scheduled for this day',
      eventsOn: 'Events on',
      event: 'event',
      events: 'events',
      source: 'Source',
      date: 'Date',
      location: 'Location',
      address: 'Address',
      district: 'District',
      viewOn: 'View on',
      adminPanel: 'Admin Panel',
      logout: 'Logout',
      configuration: 'Configuration',
      city: 'City',
      categories: 'Categories',
      updateConfig: 'Update Configuration',
      generateContent: 'Generate Content',
      startDate: 'Start Date',
      endDate: 'End Date',
      generateEvents: 'Generate Events',
      generateSummary: 'Generate Summary',
      adminLogin: 'Admin Login',
      username: 'Username',
      password: 'Password'
    },
    es: {
      title: 'Eventos Valencia',
      home: 'Inicio',
      calendar: 'Calendario',
      login: 'Acceder',
      admin: 'Admin',
      discoverTitle: 'Descubre el Corazón Cultural de Valencia',
      discoverSubtitle: 'Vive los eventos auténticos que hacen única a Valencia',
      thisWeek: 'Esta Semana en Valencia',
      next7Days: 'Próximos 7 Días',
      upcomingEvents: 'Próximos Eventos',
      loadingEvents: 'Cargando eventos...',
      noEvents: 'No hay eventos programados',
      noEventsDay: 'No hay eventos programados para este día',
      eventsOn: 'Eventos el',
      event: 'evento',
      events: 'eventos',
      source: 'Fuente',
      date: 'Fecha',
      location: 'Ubicación',
      address: 'Dirección',
      district: 'Distrito',
      viewOn: 'Ver en',
      adminPanel: 'Panel de Administración',
      logout: 'Cerrar Sesión',
      configuration: 'Configuración',
      city: 'Ciudad',
      categories: 'Categorías',
      updateConfig: 'Actualizar Configuración',
      generateContent: 'Generar Contenido',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      generateEvents: 'Generar Eventos',
      generateSummary: 'Generar Resumen',
      adminLogin: 'Acceso de Administrador',
      username: 'Usuario',
      password: 'Contraseña'
    }
  };

  const t = (key) => translations[language][key] || key;

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
        console.info("admin token generated:" + data.token);
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
        <img src={event.imageUrl} alt={event.title[language]} />
        <div className="event-date-badge">
          {new Date(event.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
      <div className="event-content">
        <h3>{event.title[language]}</h3>
        <p className="event-location">
          <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {event.location.name[language]}, {event.location.district}
        </p>
        <p className="event-description">{event.description[language]}</p>
        <div className="event-source">
          <span>{t('source')}: {event.source.provider}</span>
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
                <img src={event.imageUrl} alt={event.title[language]} />
                <div className="event-date-badge">
                  {new Date(event.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="event-content">
                <h3>{event.title[language]}</h3>
                <p className="event-location">
                  <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {event.location.name[language]}, {event.location.district}
                </p>
                <p className="event-description">{event.description[language]}</p>
                <div className="event-source">
                  <span>{t('source')}: {event.source.provider}</span>
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
        <img src={event.imageUrl} alt={event.title[language]} className="modal-image" />
        <div className="modal-body">
          <h2>{event.title[language]}</h2>
          <div className="event-details">
            <div className="detail-item">
              <strong>{t('date')}:</strong> {new Date(event.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="detail-item">
              <strong>{t('location')}:</strong> {event.location.name[language]}
            </div>
            <div className="detail-item">
              <strong>{t('address')}:</strong> {event.location.address}
            </div>
            <div className="detail-item">
              <strong>{t('district')}:</strong> {event.location.district}
            </div>
          </div>
          <p className="event-description">{event.description[language]}</p>
          <div className="event-source">
            <a href={event.source.url} target="_blank" rel="noopener noreferrer">
              {t('viewOn')} {event.source.provider}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // Admin panel component
  const AdminPanel = () => {
    const [configForm, setConfigForm] = useState(adminConfig || {});

    useEffect(() => {
      setConfigForm(adminConfig || {});
    }, [adminConfig]);

    const handleConfigSubmit = (e) => {
      e.preventDefault();
      updateAdminConfig(configForm);
    };

    const handleGenerateEvents = (e) => {
      e.preventDefault();
      generateEvents(configForm.startDate, configForm.endDate);
    };

    const handleGenerateSummary = (e) => {
      e.preventDefault();
      generateSummary(configForm.startDate, configForm.endDate);
    };

    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{t('adminPanel')}</h2>
          <button onClick={handleAdminLogout} className="logout-btn">{t('logout')}</button>
        </div>
        
        <div className="admin-section">
          <h3>{t('configuration')}</h3>
          <form onSubmit={handleConfigSubmit} className="config-form">
            <div className="form-group">
              <label>{t('city')}:</label>
              <input
                type="text"
                value={configForm.city || ''}
                onChange={(e) => setConfigForm({...configForm, city: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('categories')}:</label>
              <input
                type="text"
                value={configForm.categories?.join(', ') || ''}
                onChange={(e) => setConfigForm({...configForm, categories: e.target.value.split(', ')})}
              />
            </div>
            <div className="form-group">
              <label>{t('startDate')}:</label>
              <input
                type="date"
                value={configForm.startDate || ''}
                onChange={(e) => setConfigForm({...configForm, startDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('endDate')}:</label>
              <input
                type="date"
                value={configForm.endDate || ''}
                onChange={(e) => setConfigForm({...configForm, endDate: e.target.value})}
              />
            </div>
            <button type="submit" className="submit-btn">{t('updateConfig')}</button>
          </form>
        </div>

        <div className="admin-section">
          <h3>{t('generateContent')}</h3>
          <form className="generate-form">
            <div className="button-group">
              <button type="button" onClick={handleGenerateEvents} className="generate-btn">
                {t('generateEvents')}
              </button>
              <button type="button" onClick={handleGenerateSummary} className="generate-btn">
                {t('generateSummary')}
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
        <h2>{t('adminLogin')}</h2>
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder={t('username')}
              value={adminForm.username}
              onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder={t('password')}
              value={adminForm.password}
              onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="login-btn">{t('login')}</button>
        </form>
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">{t('title')}</h1>
          <div className="header-actions">
            <button
              className="language-toggle"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            >
              {language === 'en' ? '🇪🇸 ES' : '🇬🇧 EN'}
            </button>
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
                {t('home')}
              </button>
              <button
                className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                {t('calendar')}
              </button>
              <button
                className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                {isAdmin ? t('admin') : t('login')}
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
                <h2>{t('discoverTitle')}</h2>
                <p>{t('discoverSubtitle')}</p>
              </div>
              <div className="hero-image">
                <img src="https://images.unsplash.com/photo-1658329717628-4c051a4c6820?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxWYWxlbmNpYSUyMGNpdHlzY2FwZXxlbnwwfHx8Ymx1ZXwxNzUyNDMwMDU0fDA&ixlib=rb-4.1.0&q=85" alt="Valencia cityscape" />
              </div>
            </div>

            {summary && (
              <div className="summary-section">
                <h3>{t('thisWeek')}</h3>
                <p>{summary.summary[language]}</p>
                <div className="summary-meta">
                  <span>{summary.startDate} - {summary.endDate}</span>
                  <div className="event-types">
                    {summary.eventTypes.map(type => (
                      <span key={type} className="event-type-tag">{type}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="events-section">
              <h3>{t('next7Days')}</h3>
              {loading ? (
                <div className="loading">{t('loadingEvents')}</div>
              ) : (
                <div className="events-timeline">
                  {(() => {
                    // Get next 7 days
                    const today = new Date();
                    const next7Days = [];
                    for (let i = 0; i < 7; i++) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + i);
                      next7Days.push(date.toISOString().split('T')[0]);
                    }

                    // Group events by date for the next 7 days
                    const eventsByDate = {};
                    events.forEach(event => {
                      if (next7Days.includes(event.date)) {
                        if (!eventsByDate[event.date]) {
                          eventsByDate[event.date] = [];
                        }
                        eventsByDate[event.date].push(event);
                      }
                    });

                    return next7Days.map(date => {
                      const dayEvents = eventsByDate[date] || [];
                      const dayName = new Date(date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      return (
                        <div key={date} className="day-section">
                          <div className="day-header">
                            <h4>{dayName}</h4>
                            <span className="event-count">
                              {dayEvents.length} {dayEvents.length === 1 ? t('event') : t('events')}
                            </span>
                          </div>
                          <div className="day-events">
                            {dayEvents.length === 0 ? (
                              <div className="no-events">{t('noEvents')}</div>
                            ) : dayEvents.length === 1 ? (
                              <EventCard event={dayEvents[0]} />
                            ) : (
                              <EventDeck events={dayEvents} />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
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
                <h3>{t('eventsOn')} {new Date(selectedDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</h3>
                <div className="events-list">
                  {(() => {
                    const dayEvents = events.filter(event => event.date === selectedDate);
                    
                    if (dayEvents.length === 0) {
                      return <div className="no-events">{t('noEventsDay')}</div>;
                    } else if (dayEvents.length === 1) {
                      return <EventCard event={dayEvents[0]} />;
                    } else {
                      return <EventDeck events={dayEvents} />;
                    }
                  })()}
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