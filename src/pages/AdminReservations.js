import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/authContext";

const AdminReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(() => {
    // 페이지 로드 시 localStorage에서 submitStatus 불러오기
    const savedStatus = localStorage.getItem("submitStatus");
    return savedStatus ? JSON.parse(savedStatus) : {};
  });

  useEffect(() => {
    if (user?.isAdmin) {
      const q = collection(db, "rooms");

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const reservationData = snapshot.docs.map((doc) => {
            const data = doc.data();

            let time;
            // Firestore Timestamp 또는 ISO 8601 문자열을 처리
            if (data.time && typeof data.time.toDate === "function") {
              time = data.time.toDate(); // Firestore Timestamp 객체
            } else if (typeof data.time === "string") {
              time = new Date(data.time); // ISO 8601 문자열
            } else if (data.time instanceof Date) {
              time = data.time; // 이미 Date 객체인 경우
            } else {
              time = null; // 알 수 없는 형식
            }

            return {
              id: doc.id,
              ...data,
              time,
            };
          });
          setReservations(reservationData);
        },
        (error) => {
          console.error("Error fetching reservations:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const handleUpdateReservation = async (id, index) => {
    const reservationRef = doc(db, "rooms", id);
    const updatedReservation = {
      vehicleNumber: reservations[index].vehicleNumber,
      driverNumber: reservations[index].driverNumber,
    };

    await updateDoc(reservationRef, updatedReservation);
    setSubmitStatus((prevStatus) => {
      const newStatus = { ...prevStatus, [id]: "success" };
      // localStorage에 저장
      localStorage.setItem("submitStatus", JSON.stringify(newStatus));
      return newStatus;
    });
  };

  const handleInputChange = (index, field, value) => {
    setReservations((prevReservations) => {
      const updatedReservations = [...prevReservations];
      updatedReservations[index][field] = value;
      return updatedReservations;
    });
  };

  if (!user?.isAdmin) {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div>
      <h2>Admin Reservations</h2>
      {reservations.length === 0 ? (
        <div>예약이 없습니다.</div>
      ) : (
        reservations.map((reservation, index) => (
          <div
            key={reservation.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1 }}>
              <p><strong>출발지:</strong> {reservation.startLocation}</p>
              <p><strong>도착지:</strong> {reservation.endLocation}</p>
              <p>
                <strong>출발 시간:</strong> {reservation.time instanceof Date 
                  ? reservation.time.toLocaleDateString("ko-KR") + " " + reservation.time.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })
                  : "잘못된 시간 형식"}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <label>
                차량 번호:
                <input
                  type="text"
                  value={reservation.vehicleNumber || ""}
                  onChange={(e) => handleInputChange(index, "vehicleNumber", e.target.value)}
                  placeholder="차량 번호 입력"
                  style={{ marginLeft: "10px" }}
                />
              </label>
              <br />
              <label>
                기사 번호:
                <input
                  type="text"
                  value={reservation.driverNumber || ""}
                  onChange={(e) => handleInputChange(index, "driverNumber", e.target.value)}
                  placeholder="기사 번호 입력"
                  style={{ marginLeft: "10px" }}
                />
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => handleUpdateReservation(reservation.id, index)}
                style={{
                  backgroundColor: submitStatus[reservation.id] === "success" ? "green" : "initial",
                  color: submitStatus[reservation.id] === "success" ? "white" : "initial",
                }}
              >
                {submitStatus[reservation.id] ? "Resubmit" : "Submit"}
              </button>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: submitStatus[reservation.id] === "success" ? "green" : "gray",
                  border: "1px solid black",
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminReservations;
