import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './DiaryPage.css';

const DiaryPage = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = () => {
    navigate('/report');
  };

  const handleTempSave = () => {
    alert('임시저장 되었습니다.');
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const adjustDate = (days) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    const newDate = current.toISOString().split('T')[0];
    setDate(newDate);
  };

  return (
    <div className="diary-container">
      <Header showAuthButtons={false} />

        <h2 className="subtitle">하루의 시작과 마무리를 함께.</h2>
      <div className="diary-top">

        <div className="date-navigation">
          <button className="arrow-button left" onClick={() => adjustDate(-1)}>←</button>
          <span className="diary-date" onClick={toggleCalendar}>{date}</span>
          {date < todayStr && (
            <button className="arrow-button right" onClick={() => adjustDate(1)}>→</button>
          )}
        </div>
        {showCalendar && (
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setShowCalendar(false);
            }}
            className="calendar-input"
          />
        )}
      </div>

      <div className="diary-form">
        <input
          type="text"
          className="diary-input"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="diary-textarea"
          placeholder="내용을 입력하세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="button-group">
          <button className="btn temp" onClick={handleTempSave}>임시저장</button>
          <button className="btn submit" onClick={handleSubmit}>제출하기</button>
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
