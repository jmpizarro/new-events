import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTimes, faSpinner, faBars } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
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
  const DEFAULT_IMAGE = process.env.PUBLIC_URL + '/images/event.png';

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
      price: 'Price',
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
      uploadEvents: 'Upload Events',
      loadEvents: 'Load Events',
      selectResourceFile: 'Select Resource File',
      loadFromResources: 'Load From Resources',
      adminLogin: 'Admin Login',
      username: 'Username',
      password: 'Password',
      contact: 'Contact',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send'
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
      price: 'Precio',
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
      uploadEvents: 'Subir Eventos',
      loadEvents: 'Cargar Eventos',
      selectResourceFile: 'Seleccionar Archivo de Recursos',
      loadFromResources: 'Cargar de Recursos',
      adminLogin: 'Acceso de Administrador',
      username: 'Usuario',
      password: 'Contraseña',
      contact: 'Contacto',
      name: 'Nombre',
      email: 'Correo',
      message: 'Mensaje',
      send: 'Enviar'
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
    <div
      className="event-card bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transform transition hover:-translate-y-1 cursor-pointer"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl || DEFAULT_IMAGE}
          alt={event.title[language]}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute top-2 right-2 rounded-full bg-blue-600 text-white px-2 py-1 text-xs">
          {new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{event.title[language]}</h3>
        <p className="event-location text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
          {event.location.name[language]}, {event.location.district}
        </p>
        <p className="event-description text-sm text-gray-700 dark:text-gray-300">{event.description[language]}</p>
        {event.price && (
          <div className="event-price text-sm font-semibold">
            <span>{t('price')}: {event.price}</span>
          </div>
        )}
        <div className="event-source text-xs text-gray-500">
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
                <img
                  src={event.imageUrl || DEFAULT_IMAGE}
                  alt={event.title[language]}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
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
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                  {event.location.name[language]}, {event.location.district}
                </p>
                <p className="event-description">{event.description[language]}</p>
                {event.price && (
                  <div className="event-price">
                    <span>{t('price')}: {event.price}</span>
                  </div>
                )}
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
    <Transition appear show={!!event} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-20 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-700 p-6 text-left align-middle shadow-xl transition-all">
              <button className="absolute right-4 top-4 text-gray-500" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <img
                src={event.imageUrl || DEFAULT_IMAGE}
                alt={event.title[language]}
                className="mb-4 h-60 w-full rounded object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <Dialog.Title as="h2" className="text-lg font-bold mb-2">
                {event.title[language]}
              </Dialog.Title>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>{t('date')}:</strong> {new Date(event.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div>
                  <strong>{t('location')}:</strong> {event.location.name[language]}
                </div>
                <div>
                  <strong>{t('address')}:</strong> {event.location.address}
                </div>
                <div>
                  <strong>{t('district')}:</strong> {event.location.district}
                </div>
                {event.price && (
                  <div>
                    <strong>{t('price')}:</strong> {event.price}
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{event.description[language]}</p>
              <div className="mt-4 text-right text-sm">
                <a href={event.source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {t('viewOn')} {event.source.provider}
                </a>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

  // Admin panel component
  const AdminPanel = () => {
    const [configForm, setConfigForm] = useState(adminConfig || {});
    const [selectedFile, setSelectedFile] = useState(null);
    const [eventFiles, setEventFiles] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [activeSection, setActiveSection] = useState('config');

    useEffect(() => {
      setConfigForm(adminConfig || {});
      fetchEventFiles();
    }, [adminConfig]);

    useEffect(() => {
      if (adminToken) fetchEventFiles();
    }, [adminToken]);

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

    const handleFileChange = (e) => {
      setSelectedFile(e.target.files[0]);
    };

    const handleUploadEvents = async (e) => {
      e.preventDefault();
      if (!selectedFile) return;
      try {
        const text = await selectedFile.text();
        const response = await fetch(`${API_BASE_URL}/api/admin/upload-events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: text
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message);
          fetchEvents();
        } else {
          const error = await response.json();
          alert(`Failed to upload events: ${error.detail}`);
        }
      } catch (error) {
        console.error('Error uploading events:', error);
        alert('Failed to upload events');
      }
    };

    const fetchEventFiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/event-files`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEventFiles(data);
          if (data.length > 0) setSelectedResource(data[0]);
        }
      } catch (err) {
        console.error('Error fetching event files', err);
      }
    };

    const handleLoadResource = async (e) => {
      e.preventDefault();
      if (!selectedResource) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/load-events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ path: selectedResource })
        });
        if (response.ok) {
          const data = await response.json();
          alert(data.message);
          fetchEvents();
        } else {
          const error = await response.json();
          alert(`Failed to load events: ${error.detail}`);
        }
      } catch (err) {
        console.error('Error loading events', err);
        alert('Failed to load events');
      }
    };

    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{t('adminPanel')}</h2>
          <button onClick={handleAdminLogout} className="logout-btn">{t('logout')}</button>
        </div>

        <div className="admin-layout">
          <nav className="admin-nav">
            <ul>
              <li className={activeSection === 'config' ? 'active' : ''} onClick={() => setActiveSection('config')}>{t('configuration')}</li>
              <li className={activeSection === 'generate' ? 'active' : ''} onClick={() => setActiveSection('generate')}>{t('generateContent')}</li>
              <li className={activeSection === 'upload' ? 'active' : ''} onClick={() => setActiveSection('upload')}>{t('uploadEvents')}</li>
              <li className={activeSection === 'load' ? 'active' : ''} onClick={() => setActiveSection('load')}>{t('loadFromResources')}</li>
            </ul>
          </nav>
          <div className="admin-content">
            {activeSection === 'config' && (
              <div className="admin-section">
                <h3>{t('configuration')}</h3>
                <form onSubmit={handleConfigSubmit} className="config-form">
                  <div className="form-group">
                    <label>{t('city')}:</label>
                    <input
                      type="text"
                      value={configForm.city || ''}
                      onChange={(e) => setConfigForm({ ...configForm, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('categories')}:</label>
                    <input
                      type="text"
                      value={configForm.categories?.join(', ') || ''}
                      onChange={(e) => setConfigForm({ ...configForm, categories: e.target.value.split(', ') })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('startDate')}:</label>
                    <input
                      type="date"
                      value={configForm.startDate || ''}
                      onChange={(e) => setConfigForm({ ...configForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('endDate')}:</label>
                    <input
                      type="date"
                      value={configForm.endDate || ''}
                      onChange={(e) => setConfigForm({ ...configForm, endDate: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="submit-btn">{t('updateConfig')}</button>
                </form>
              </div>
            )}

            {activeSection === 'generate' && (
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
            )}

            {activeSection === 'upload' && (
              <div className="admin-section">
                <h3>{t('uploadEvents')}</h3>
                <form onSubmit={handleUploadEvents} className="upload-form">
                  <div className="form-group">
                    <input type="file" accept=".json" onChange={handleFileChange} />
                  </div>
                  <button type="submit" className="submit-btn">{t('loadEvents')}</button>
                </form>
              </div>
            )}

            {activeSection === 'load' && (
              <div className="admin-section">
                <h3>{t('loadFromResources')}</h3>
                <form onSubmit={handleLoadResource} className="upload-form">
                  <div className="form-group">
                    <label>{t('selectResourceFile')}:</label>
                    <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}>
                      {eventFiles.map(file => (
                        <option key={file} value={file}>{file}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="submit-btn">{t('loadEvents')}</button>
                </form>
              </div>
            )}
          </div>
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

  const ContactForm = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '', message: '' });
      alert('Message sent');
    };

    return (
      <div className="contact-panel max-w-lg mx-auto bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <div className="admin-header mb-4">
          <h2 className="text-xl font-semibold">{t('contact')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">{t('name')}</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('email')}</label>
            <input
              type="email"
              className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('message')}</label>
            <textarea
              rows="4"
              className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-btn bg-blue-600 text-white px-4 py-2 rounded">
            {t('send')}
          </button>
        </form>
      </div>
    );
  };

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
            <Menu as="div" className="relative">
              <Menu.Button className="nav-menu-btn">
                <FontAwesomeIcon icon={faBars} />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} nav-item w-full text-left`}
                          onClick={() => setCurrentView('home')}
                        >
                          {t('home')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} nav-item w-full text-left`}
                          onClick={() => setCurrentView('calendar')}
                        >
                          {t('calendar')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} nav-item w-full text-left`}
                          onClick={() => setCurrentView('contact')}
                        >
                          {t('contact')}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} nav-item w-full text-left`}
                          onClick={() => setCurrentView('admin')}
                        >
                          {isAdmin ? t('admin') : t('login')}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
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
                <div className="loading flex items-center justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  {t('loadingEvents')}
                </div>
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

        {currentView === 'contact' && (
          <ContactForm />
        )}
      </main>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Valencia Events</p>
          <div className="footer-links space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://wa.me" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
