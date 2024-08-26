import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore 인스턴스를 가져옵니다
import { useAdminCheck } from "../hooks/useAdminCheck"; // 관리자 권한을 확인하는 훅을 가져옵니다

const Board = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const isAdmin = useAdminCheck(); // 관리자인지 확인합니다

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  

  const handleAddPost = async () => {
    if (newPost.trim() === "") return;
    await addDoc(collection(db, "posts"), { content: newPost });
    setNewPost("");
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData); // 새 게시물을 추가한 후 로컬 상태 업데이트
  };

  const handleUpdatePost = async (id, newContent) => {
    if (newContent.trim() === "") return;
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, { content: newContent });
    setPosts(posts.map(post => post.id === id ? { ...post, content: newContent } : post)); // 로컬 상태 업데이트
  };

  const handleDeletePost = async (id) => {
    const postRef = doc(db, "posts", id);
    await deleteDoc(postRef); // Firestore에서 문서를 삭제합니다
    setPosts(posts.filter(post => post.id !== id)); // 로컬 상태에서도 삭제된 게시물 제거
  };

  return (
    <div>
      <h2>Board</h2>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.content}</p>
          {isAdmin && (
            <>
              <button onClick={() => handleUpdatePost(post.id, prompt("New content:", post.content))}>
                Edit
              </button>
              <button onClick={() => handleDeletePost(post.id)}>Delete</button> {/* 삭제 버튼 */}
            </>
          )}
        </div>
      ))}
      {isAdmin && (
        <div>
          <input
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="New post"
          />
          <button onClick={handleAddPost}>Add Post</button>
        </div>
      )}
    </div>
  );
};

export default Board;
