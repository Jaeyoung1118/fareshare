import React, { useState } from "react";

const LocationSelector = ({ onLocationsSelected }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const locations = ["지스트 기숙사", "유스퀘어 터미널", "광주송정역"];

  const handleSelection = () => {
    if (startLocation === endLocation) {
      alert("출발지와 도착지가 같을 수 없습니다.");
    } else if (!startLocation || !endLocation) {
      alert("출발지와 도착지를 모두 선택하세요.");
    } else {
      onLocationsSelected({ startLocation, endLocation });
    }
  };

  return (
    <div>
      <div>
        <label>출발지: </label>
        <select value={startLocation} onChange={(e) => setStartLocation(e.target.value)}>
          <option value="">출발지 선택</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>
      <div>
        <label>도착지: </label>
        <select value={endLocation} onChange={(e) => setEndLocation(e.target.value)}>
          <option value="">도착지 선택</option>
          {locations.map((location) => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>
      <button onClick={handleSelection}>Booking Page로 이동</button>
    </div>
  );
};

export default LocationSelector;
