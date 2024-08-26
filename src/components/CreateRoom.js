import React, { useState } from "react";
import DatePicker from "react-datepicker"; // npm install react-datepicker
import "react-datepicker/dist/react-datepicker.css";

const CreateRoom = ({ onCreate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("04:00");

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isValidTime = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return (hour >= 4 && hour < 21) || (hour === 21 && minute === 0);
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert("날짜와 시간을 선택하세요.");
      return;
    }

    if (isPastDate(selectedDate)) {
      alert("과거 날짜는 선택할 수 없습니다.");
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      ...selectedTime.split(":").map(Number)
    );

    if (selectedDateTime < new Date(now.getTime() + 12 * 60 * 60 * 1000)) {
      alert("출발 시간은 최소 12시간 이후여야 합니다.");
      return;
    }

    if (!isValidTime(selectedTime)) {
      alert("예약은 4시부터 21시 30분 전까지만 가능합니다.");
      return;
    }

    onCreate(selectedDateTime);
  };

  return (
    <div>
      <h3>방 만들기</h3>
      <div>
        <label>날짜 선택:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy/MM/dd"
          minDate={new Date()}
          showPopperArrow={false}
        />
      </div>
      <div>
        <label>시간 선택:</label>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          {Array.from({ length: 18 }, (_, i) => {
            const hour = String(i + 4).padStart(2, "0");
            return (
              <React.Fragment key={hour}>
                <option value={`${hour}:00`}>{`${hour}:00`}</option>
                <option value={`${hour}:30`}>{`${hour}:30`}</option>
              </React.Fragment>
            );
          })}
        </select>
      </div>
      <button onClick={handleSubmit}>방 만들기</button>
    </div>
  );
};

export default CreateRoom;
