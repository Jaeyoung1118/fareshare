// src/components/ChatRoom.js

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import "./ChatRoom.css"; // 스타일링을 위한 CSS 파일

const ChatRoom = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef(null); // 스크롤 위치 참조

  useEffect(() => {
    if (roomId) {
      const unsubscribe = listenForMessages(roomId);
      return () => unsubscribe();
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // messages가 업데이트될 때마다 스크롤 이동

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const listenForMessages = (roomId) => {
    const messagesQuery = query(
      collection(db, `rooms/${roomId}/messages`),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched messages:", newMessages); // 상태 업데이트 확인
      setMessages(newMessages); // 상태 업데이트
    });
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        senderId: user.uid,
        senderName: user.displayName || "You",
        content: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>Group Chat</h3> {/* 방 이름이나 제목 */}
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.senderId === user.uid ? "own" : ""}`}>
            <div className="message-content">
              <span className="sender-name">{msg.senderId === user.uid ? "You" : msg.senderName}</span>
              <p>{msg.content}</p>
              <span className="timestamp">
                {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress} // Enter 키 감지
          placeholder="Type a message..."
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-send-button">Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
