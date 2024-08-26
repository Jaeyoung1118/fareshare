import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore를 가져옵니다

const Contact = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // 전화번호 상태 추가
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

    if (!name || !phone || !message) {
      alert("모든 필드를 채워주세요.");
      return;
    }

    if (!phoneRegex.test(phone)) {
        alert("올바른 형식의 전화번호를 입력해 주세요.");
        return;
    }

    try {
      await addDoc(collection(db, "inquiries"), {
        name,
        phone, // Firestore에 전화번호 저장
        message,
        timestamp: new Date(),
      });

      setSuccessMessage("문의사항이 성공적으로 제출되었습니다.");
      setName("");
      setPhone(""); // 제출 후 전화번호 필드 초기화
      setMessage("");
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert("문의사항 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Contact Us</h2>
      <p>불편한 점이나 문의사항을 작성해 주세요. 가능한 한 빨리 응답해 드리겠습니다.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          이름:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </label>
        <label>
          전화번호:
          <input
            type="tel" // 입력 유형을 전화번호로 변경
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />
        </label>
        <label>
          불편사항/문의사항:
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.textarea}
          ></textarea>
        </label>
        <button type="submit" style={styles.button}>제출</button>
        {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    margin: "0 auto",
  },
  input: {
    marginBottom: "10px",
    padding: "8px",
    fontSize: "16px",
  },
  textarea: {
    marginBottom: "10px",
    padding: "8px",
    fontSize: "16px",
    height: "100px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  successMessage: {
    color: "green",
    marginTop: "10px",
  },
};

export default Contact;
