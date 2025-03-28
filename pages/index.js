// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import { Form, Button, Alert } from 'react-bootstrap';

// export default function Home() {
//   const router = useRouter();
//   const [roomId, setRoomId] = useState('');
//   const [userName, setUserName] = useState('');
//   const [error, setError] = useState('');

//   const handleCreateRoom = async (e) => {
//     e.preventDefault();
//     try {
//       const newRoomId = `room-${Date.now()}`;
//       router.push(`/room?roomId=${newRoomId}&name=${userName}`);
//     } catch (error) {
//       setError('Tạo phòng thất bại');
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h1 className="text-center mb-4">Zoom Clone với Stringee</h1>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Form onSubmit={handleCreateRoom} className="w-50 mx-auto">
//         <Form.Group className="mb-3">
//           <Form.Label>Tên của bạn</Form.Label>
//           <Form.Control
//             type="text"
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//             required
//           />
//         </Form.Group>

//         <Button type="submit" variant="primary" className="w-100">
//           Tạo phòng mới
//         </Button>
//       </Form>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Alert } from "react-bootstrap";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const loading = status === "loading";

  // Cập nhật userName khi đăng nhập thành công
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      if (!userName) {
        setError("Vui lòng nhập tên hoặc đăng nhập");
        return;
      }

      const newRoomId = `room-${Date.now()}`;
      router.push(`/room?roomId=${newRoomId}&name=${userName}`);
    } catch (error) {
      setError("Tạo phòng thất bại");
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId || !userName) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    router.push(`/room?roomId=${roomId}&name=${userName}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Zoom Clone với Stringee</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              {!session ? (
                <>
                  <h4 className="card-title text-center mb-4">Đăng nhập</h4>
                  <Button
                    onClick={() => signIn("google")}
                    className="w-100 mb-3"
                    variant="danger"
                  >
                    <FaGoogle className="me-2" /> Đăng nhập với Google
                  </Button>
                  <hr />
                  <p className="text-center">Hoặc tiếp tục với tư cách khách</p>
                </>
              ) : (
                <div className="text-center mb-4">
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="rounded-circle mb-2"
                    width="50"
                    height="50"
                  />
                  <h5>Xin chào, {session.user.name}</h5>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => signOut()}
                    className="mb-3"
                  >
                    Đăng xuất
                  </Button>
                </div>
              )}

              <Form onSubmit={handleCreateRoom}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên của bạn</Form.Label>
                  <Form.Control
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={
                      session ? session.user.name : "Nhập tên của bạn"
                    }
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 mb-3">
                  Tạo phòng mới
                </Button>
              </Form>

              <hr />

              <Form onSubmit={handleJoinRoom}>
                <Form.Group className="mb-3">
                  <Form.Label>Tham gia phòng hiện có</Form.Label>
                  <Form.Control
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Nhập ID phòng"
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="success" className="w-100">
                  Tham gia phòng
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
