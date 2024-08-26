import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import Header from "../components/Header";
import LocationSelector from "../components/LocationSelector";
import ChatRoom from "../components/ChatRoom";
import { useAuth } from "../context/authContext";
import { db } from "../firebase";
import { collection, doc, query, where, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

const Home = () => {
  const [myBooking, setMyBooking] = useState(null); // 현재 유저의 예약
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "rooms"),
        where("participants", "array-contains", user.uid)
      );

      // Firestore 실시간 업데이트 감지
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const myBookingData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          time: new Date(doc.data().time), // Date 객체로 변환
        }));
        setMyBooking(myBookingData[0]); // 한 유저가 하나의 예약만 가정
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLocationsSelected = ({ startLocation, endLocation }) => {
    // 예약이 있는 경우에도 booking 페이지로 이동 가능
    navigate("/booking", { state: { startLocation, endLocation, existingBooking: myBooking } });
  };

  const handleCancelBooking = async () => {
    if (myBooking) {
      const roomRef = doc(db, "rooms", myBooking.id);
      const updatedParticipants = myBooking.participants.filter(uid => uid !== user.uid);

      if (updatedParticipants.length === 0) {
        // 방에 남은 사람이 없으면 방을 삭제
        await deleteDoc(roomRef);
        alert("방에 참가한 사람이 없어 방이 삭제되었습니다.");
      } else {
        // 방에 다른 참가자가 있으면 참가자 목록에서 현재 사용자 제거
        await updateDoc(roomRef, {
          participants: updatedParticipants
        });
        alert("예약이 취소되었습니다.");
      }

      setMyBooking(null); // 나의 예약 상태 초기화
    }
  };

  return (
    <div>
      {/* 헤더 컴포넌트 */}
      <Header />
      
      {/* 위치 선택 컴포넌트 */}
      <LocationSelector onLocationsSelected={handleLocationsSelected} />

      {/* 예약 정보 및 취소 버튼 */}
      <div>
        <h3>나의 예약</h3>
        {myBooking ? (
          <div>
            <p>출발지: {myBooking.startLocation}</p>
            <p>도착지: {myBooking.endLocation}</p>
            <p>날짜 및 시간: {myBooking.time.toLocaleDateString("ko-KR")} {myBooking.time.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}</p>
            <div style={styles.dots}>
              {Array(3).fill().map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.dot,
                    backgroundColor: myBooking.participants.length > i ? "red" : "white"
                  }}
                />
              ))}
            </div>
            {/* 차량번호와 기사번호 표시 */}
            <p>차량 번호: {myBooking.vehicleNumber || "미지정"}</p>
            <p>기사 번호: {myBooking.driverNumber || "미지정"}</p>
            <button onClick={handleCancelBooking}>예약 취소</button>
          </div>
        ) : (
          <p>예약이 없습니다</p>
        )}
      </div>

      {/* ChatRoom 컴포넌트를 사용하여 메시지 기능 추가 */}
      {myBooking && <ChatRoom roomId={myBooking.id} />}

      {/* 게시판 컴포넌트 */}
      <Board />
    </div>
  );
};

// 스타일링
const styles = {
  dots: {
    display: "flex",
    marginTop: "8px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "2px solid black",
    margin: "0 2px",
  },
};

export default Home;
