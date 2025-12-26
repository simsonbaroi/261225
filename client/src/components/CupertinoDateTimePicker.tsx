import React, { useState, useEffect, useRef } from 'react';
import './CupertinoDateTimePicker.css';

interface CupertinoDateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  title?: string;
}

export const CupertinoDateTimePicker: React.FC<CupertinoDateTimePickerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDate = new Date(),
  title = "Select Date & Time"
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Refs for smooth scrolling
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  
  // Generate comprehensive date/time data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];
  
  // Get current selections
  const currentMonth = selectedDate.getMonth();
  const currentDay = selectedDate.getDate();
  const currentYear = selectedDate.getFullYear();
  const currentHour12 = selectedDate.getHours() % 12 || 12;
  const currentMinute = selectedDate.getMinutes();
  const currentPeriod = selectedDate.getHours() >= 12 ? 'PM' : 'AM';
  
  // Generate days for current month
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Smooth scroll to selected item
  const scrollToItem = (containerRef: React.RefObject<HTMLDivElement>, index: number) => {
    if (containerRef.current) {
      const itemHeight = 36; // Height of each picker item (smaller)
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = (index * itemHeight) - (containerHeight / 2) + (itemHeight / 2);
      
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  };
  
  // Initialize scroll positions
  useEffect(() => {
    if (isOpen && showTimePicker) {
      setTimeout(() => {
        scrollToItem(hourRef, hours.indexOf(currentHour12));
        scrollToItem(minuteRef, currentMinute);
        scrollToItem(periodRef, periods.indexOf(currentPeriod));
      }, 100);
    }
  }, [isOpen, showTimePicker, currentHour12, currentMinute, currentPeriod]);
  
  useEffect(() => {
    if (isOpen && showDatePicker) {
      setTimeout(() => {
        scrollToItem(monthRef, currentMonth);
        scrollToItem(dayRef, currentDay - 1);
        scrollToItem(yearRef, years.indexOf(currentYear));
      }, 100);
    }
  }, [isOpen, showDatePicker, currentMonth, currentDay, currentYear]);
  
  // Date selection handlers
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    // Adjust day if it exceeds the new month's days
    const maxDays = getDaysInMonth(monthIndex, newDate.getFullYear());
    if (newDate.getDate() > maxDays) {
      newDate.setDate(maxDays);
    }
    setSelectedDate(newDate);
  };
  
  const handleDaySelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };
  
  const handleYearSelect = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    // Adjust for leap year if needed
    const maxDays = getDaysInMonth(newDate.getMonth(), year);
    if (newDate.getDate() > maxDays) {
      newDate.setDate(maxDays);
    }
    setSelectedDate(newDate);
  };
  
  // Time selection handlers
  const handleHourSelect = (hour: number) => {
    const newDate = new Date(selectedDate);
    const currentHour24 = newDate.getHours();
    const isPM = currentHour24 >= 12;
    const hour24 = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    newDate.setHours(hour24);
    setSelectedDate(newDate);
  };
  
  const handleMinuteSelect = (minute: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMinutes(minute);
    setSelectedDate(newDate);
  };
  
  const handlePeriodSelect = (period: string) => {
    const newDate = new Date(selectedDate);
    const currentHour24 = newDate.getHours();
    const currentHour12 = currentHour24 % 12 || 12;
    
    if (period === 'AM') {
      newDate.setHours(currentHour12 === 12 ? 0 : currentHour12);
    } else {
      newDate.setHours(currentHour12 === 12 ? 12 : currentHour12 + 12);
    }
    setSelectedDate(newDate);
  };

  // Format date display
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  // Format time display
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate);
      setShowDatePicker(true);
      setShowTimePicker(false);
    }
  }, [isOpen, initialDate]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="cupertino-picker bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="picker-header">
          <h2>{title}</h2>
          <div className="selected-datetime">
            {formatDate(selectedDate)} at {formatTime(selectedDate)}
          </div>
          <div className="picker-navigation">
            <button
              className={`nav-button ${showDatePicker ? 'active' : ''}`}
              onClick={() => {
                setShowDatePicker(true);
                setShowTimePicker(false);
              }}
            >
              Date
            </button>
            <button
              className={`nav-button ${showTimePicker ? 'active' : ''}`}
              onClick={() => {
                setShowDatePicker(false);
                setShowTimePicker(true);
              }}
            >
              Time
            </button>
          </div>
        </div>
        
        {showDatePicker && (
          <div className="date-time-picker">
            <div className="picker-columns">
              {/* Month Column */}
              <div className="picker-column">
                <div className="picker-column-header">Month</div>
                <div className="picker-scroll-container" ref={monthRef}>
                  {months.map((month, index) => (
                    <div
                      key={month}
                      className={`picker-item ${currentMonth === index ? 'selected' : ''}`}
                      onClick={() => handleMonthSelect(index)}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Day Column */}
              <div className="picker-column">
                <div className="picker-column-header">Day</div>
                <div className="picker-scroll-container" ref={dayRef}>
                  {days.map((day) => (
                    <div
                      key={day}
                      className={`picker-item ${currentDay === day ? 'selected' : ''}`}
                      onClick={() => handleDaySelect(day)}
                    >
                      {day.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Year Column */}
              <div className="picker-column">
                <div className="picker-column-header">Year</div>
                <div className="picker-scroll-container" ref={yearRef}>
                  {years.map((year) => (
                    <div
                      key={year}
                      className={`picker-item ${currentYear === year ? 'selected' : ''}`}
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showTimePicker && (
          <div className="date-time-picker">
            <div className="picker-columns">
              {/* Hour Column */}
              <div className="picker-column">
                <div className="picker-column-header">Hour</div>
                <div className="picker-scroll-container" ref={hourRef}>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`picker-item ${currentHour12 === hour ? 'selected' : ''}`}
                      onClick={() => handleHourSelect(hour)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Minute Column */}
              <div className="picker-column">
                <div className="picker-column-header">Minute</div>
                <div className="picker-scroll-container" ref={minuteRef}>
                  {minutes.map((minute) => (
                    <div
                      key={minute}
                      className={`picker-item ${currentMinute === minute ? 'selected' : ''}`}
                      onClick={() => handleMinuteSelect(minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Period Column */}
              <div className="picker-column">
                <div className="picker-column-header">Period</div>
                <div className="picker-scroll-container" ref={periodRef}>
                  {periods.map((period) => (
                    <div
                      key={period}
                      className={`picker-item ${currentPeriod === period ? 'selected' : ''}`}
                      onClick={() => handlePeriodSelect(period)}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="picker-actions">
          <button className="picker-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="picker-button confirm" onClick={() => onConfirm(selectedDate)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};