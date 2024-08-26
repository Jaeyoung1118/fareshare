import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, query, where, onSnapshot, deleteDoc } from "firebase/firestore";
import CreateRoom from "../components/CreateRoom"; // 방 생성 컴포넌트

const Booking = () => {
  const location = useLocation();
  const { startLocation, endLocation } = location.state || {};
  const [myBooking, setMyBooking] = useState(null);
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // 실시간으로 사용자의 예약 정보 가져오기
      const bookingQuery = query(
        collection(db, "rooms"),
        where("participants", "array-contains", user.uid)
      );

      const unsubscribeBooking = onSnapshot(bookingQuery, (snapshot) => {
        const myBookingData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const time = data.time && data.time.toDate ? data.time.toDate() : new Date(data.time); // Date 객체로 변환
          return {
            id: doc.id,
            ...data,
            time,
          };
        });
        setMyBooking(myBookingData[0]); // 한 유저가 하나의 예약만 가정
      });

      // 실시간으로 동일 경로의 방 목록 가져오기
      if (startLocation && endLocation) {
        const roomsQuery = query(
          collection(db, "rooms"),
          where("startLocation", "==", startLocation),
          where("endLocation", "==", endLocation)
        );

        const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          const fetchedRooms = snapshot.docs.map((doc) => {
            const data = doc.data();
            const time = data.time && data.time.toDate ? data.time.toDate() : new Date(data.time); // Date 객체로 변환
            return {
              id: doc.id,
              ...data,
              time,
            };
          });
          setRooms(fetchedRooms);
        });

        return () => {
          unsubscribeBooking();
          unsubscribeRooms();
        };
      } else {
        return unsubscribeBooking;
      }
    }
  }, [startLocation, endLocation, user]);

  const handleCreateRoom = async (selectedDateTime) => {
    if (myBooking) {
      alert("이미 예약된 방이 있습니다. 다른 방을 예약할 수 없습니다.");
      return;
    }

    const newRoom = {
      startLocation,
      endLocation,
      time: selectedDateTime.toISOString(),
      participants: [user.uid], // 방 생성 시 참가자로 유저 추가
    };

    const docRef = await addDoc(collection(db, "rooms"), newRoom);
    alert("방이 성공적으로 생성되었습니다.");
    setMyBooking({ id: docRef.id, ...newRoom }); // 나의 예약으로 설정
  };

  const handleJoinRoom = async (roomId) => {
    if (myBooking) {
      alert("이미 예약된 방이 있습니다. 다른 방을 예약할 수 없습니다.");
      return;
    }

    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      participants: [...rooms.find(room => room.id === roomId).participants, user.uid]
    });
    alert("예약이 성공적으로 완료되었습니다.");
    setMyBooking({ id: roomId, ...rooms.find(room => room.id === roomId) }); // 나의 예약으로 설정
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
      <h2>Booking Page</h2>

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
            <button onClick={handleCancelBooking}>예약 취소</button>
          </div>
        ) : (
          <p>예약이 없습니다</p>
        )}
      </div>

      <CreateRoom onCreate={handleCreateRoom} />

      <div>
        <h3>동일 경로 예약 현황</h3>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room.id}>
              <p>{room.time.toLocaleDateString("ko-KR")} {room.time.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })} - {room.participants.length}/3 명</p>
              <div style={styles.dots}>
                {Array(3).fill().map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.dot,
                      backgroundColor: room.participants.length > i ? "red" : "white"
                    }}
                  />
                ))}
              </div>
              <button 
                disabled={room.participants.length >= 3} 
                onClick={() => handleJoinRoom(room.id)}>
                예약하기
              </button>
            </div>
          ))
        ) : (
          <p>해당 경로에 예약된 방이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

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

export default Booking;
