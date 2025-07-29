import React, { useState } from 'react';
import Header from '../components/Header';
import './ReportPage.css';
import chartPlaceholder from '../img/chart-placeholder.png';


const ReportPage = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  const adjustDate = (days) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="report-container">
      <Header showAuthButtons={false} />

      <div className="report-top">
        <div className="date-navigation">
          <button className="arrow-button left" onClick={() => adjustDate(-1)}>←</button>
          <span className="report-date" onClick={() => setShowCalendar(!showCalendar)}>{date}</span>
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

      <div className="report-box">
        <div className="report-content-wrapper">
          <div className="report-section">
            <div className="report-section-title">주요 감정</div>
            <div>행복, 편안함</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">핵심 키워드</div>
            <div>햇살, 산책, 커피</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">지표 추이</div>
            <img src={chartPlaceholder} alt="차트" className="centered-image" />
          </div>

          <div className="report-section">
            <div className="report-section-title">Problem</div>
            <div>집중이 안 됨</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Thought</div>
            <div>밖에 나가면 괜찮을까?</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Resource</div>
            <div>예전에 했던 산책</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">과거 해결책</div>
            <div>운동</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">현재 해결책</div>
            <div>산책</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">피드백</div>
            <div>기분이 나아졌다</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">반복 패턴</div>
            <div>힘들 땐 산책이 도움 된다</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">추천</div>
            <div>
              • 산책하기 (만족도: 80%)<br />
              • 커피 마시기 (만족도: 90%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
