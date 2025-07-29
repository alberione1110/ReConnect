import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from '../components/Header';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const goToDiaryPage = () => {
    navigate('/diary');
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  const adjustDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    // 오늘보다 미래로는 못 가게 제한
    if (newDate > today) return;
    setSelectedDate(newDate);
  };

  return (
    <div className="home-container">
      <Header />

      <main className="main-content">
        <h1 className="main-slogan">Start with a diary.<br />shift your day.</h1>
        <button className="btn big" onClick={goToDiaryPage}>일기 작성</button>

        <section className="section">
          <h3 className="section-title">과거 일기</h3>
          <div className="past-diary">
            <div className="calendar">
              <Calendar
                className="custom-calendar"
                onChange={setSelectedDate}
                value={selectedDate}
              />
            </div>
            <div className="diary-preview">
              <div className="date-navigation">
                <button className="arrow-button left" onClick={() => adjustDate(-1)}>←</button>
                <span className="preview-date">{formatDate(selectedDate)}</span>
                {formatDate(selectedDate) < formatDate(today) && (
                  <button className="arrow-button right" onClick={() => adjustDate(1)}>→</button>
                )}
              </div>
              <div className="diary-box" />
              <a className="read-more">더보기 &gt;</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
