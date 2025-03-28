import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Alert, Form, Modal, InputGroup } from "react-bootstrap";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaCopy,
} from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function Room() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const loading = sessionStatus === "loading";

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const roomRef = useRef(null);
  const localTrackRef = useRef(null);

  // State
  const [status, setStatus] = useState("Đang kết nối...");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [roomLink, setRoomLink] = useState("");
  const [participants, setParticipants] = useState([]);

  // Generate safe user ID
  const getSafeUserId = useCallback(() => {
    const { name: userNameFromQuery } = router.query;
    try {
      const name = session?.user?.name || userNameFromQuery;
      return name
        ? String(name).replace(/\s+/g, "-").toLowerCase()
        : `guest-${Date.now()}`;
    } catch (error) {
      console.error("Error generating userId:", error);
      return `guest-${Date.now()}`;
    }
  }, [router.query, session]);

  // Initialize call
  useEffect(() => {
    if (!router.isReady) return;

    const roomId = router.query.roomId;
    const userId = getSafeUserId();

    if (!roomId || !userId) {
      setStatus("Thiếu thông tin phòng hoặc người dùng");
      return;
    }

    // Generate room link
    setRoomLink(
      `${window.location.origin}/room?roomId=${roomId}&name=guest-${Date.now()}`
    );

    let localTrack;
    let room;
    let client;

    // Lưu trữ các ref hiện tại vào biến cục bộ
    const currentLocalVideo = localVideoRef.current;
    const currentRemoteVideo = remoteVideoRef.current;

    const initCall = async () => {
      try {
        // 1. Get room token
        const res = await fetch(`/api/token?userId=${userId}&roomId=${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch token");

        const { token } = await res.json();
        if (!token) {
          setStatus("Không nhận được token");
          return;
        }

        const STRINGEE_SERVER_ADDRS = [
          "wss://v1.stringee.com:6899/",
          "wss://v2.stringee.com:6899/",
        ];

        // 2. Initialize client
        client = new window.StringeeClient(STRINGEE_SERVER_ADDRS);
        clientRef.current = client;

        // Handle authentication
        client.on("authen", async (res) => {
          if (res.r !== 0) {
            console.error("Authentication failed:", res.message);
            setStatus(`Lỗi xác thực: ${res.message}`);
            return;
          }

          console.log("Authenticated successfully");
          setStatus("Đã kết nối");

          try {
            // Get media devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
              (device) => device.kind === "videoinput"
            );
            console.log("Available cameras:", videoDevices);

            // Get local stream
            const localStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: {
                width: 640,
                height: 480,
              },
            });

            // Display local stream
            if (currentLocalVideo) {
              currentLocalVideo.srcObject = localStream;
            }

            // Join room
            const joinResponse = await window.StringeeVideo.joinRoom(
              client,
              token
            );
            console.log("Join room response:", joinResponse);

            room = joinResponse.room;
            roomRef.current = room;

            // Create and publish local track
            localTrack = new window.StringeeVideo.LocalVideoTrack(localStream, {
              audio: true,
            });
            localTrackRef.current = localTrack;

            await room.publish(localTrack);

            // Handle remote tracks
            room.on("addtrack", (track) => {
              if (track.kind === "video" && currentRemoteVideo) {
                track.play(currentRemoteVideo);
              }
            });
          } catch (error) {
            console.error("Error accessing media devices:", error);
            setStatus(`Lỗi truy cập thiết bị: ${error.message}`);
          }
        });

        // Connect client
        client.connect(token);
      } catch (error) {
        console.error("Room initialization error:", error);
        setStatus(`Lỗi khởi tạo: ${error.message}`);
      }
    };

    initCall();

    // Cleanup function - sử dụng các biến cục bộ
    return () => {
      if (localTrack) {
        localTrack.stop();
        if (currentLocalVideo) {
          currentLocalVideo.srcObject = null;
        }
      }
      if (room) {
        room.leave();
      }
      if (client) {
        client.disconnect();
      }

      // Reset các ref
      clientRef.current = null;
      roomRef.current = null;
      localTrackRef.current = null;
    };
  }, [router.isReady, router.query, getSafeUserId]);

  // Toggle microphone
  const toggleMute = useCallback(() => {
    if (!localTrackRef.current) return;

    if (isMuted) {
      localTrackRef.current.unmuteMicrophone();
    } else {
      localTrackRef.current.muteMicrophone();
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localTrackRef.current) return;

    if (isVideoOff) {
      localTrackRef.current.enableVideo();
    } else {
      localTrackRef.current.disableVideo();
    }
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  // Copy room link
  const copyRoomLink = useCallback(() => {
    if (!roomLink) return;
    navigator.clipboard
      .writeText(roomLink)
      .then(() => alert("Đã sao chép link phòng!"))
      .catch((err) => console.error("Copy failed:", err));
  }, [roomLink]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100">
        <div className="col-md-9 h-100 p-0">
          <div className="position-relative h-100">
            <video
              ref={remoteVideoRef}
              className="w-100 h-100 bg-dark"
              autoPlay
              playsInline
            />
            <video
              ref={localVideoRef}
              className="position-absolute bottom-0 end-0 m-3"
              width="200"
              autoPlay
              muted
              playsInline
            />
          </div>
        </div>
        <div className="col-md-3 p-3">
          <h4>Trạng thái</h4>
          <Alert variant={status === "Đã kết nối" ? "success" : "info"}>
            {status}
          </Alert>

          <div className="d-flex justify-content-between my-3">
            <Button
              variant={isMuted ? "secondary" : "primary"}
              onClick={toggleMute}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </Button>

            <Button
              variant={isVideoOff ? "secondary" : "primary"}
              onClick={toggleVideo}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </Button>

            <Button variant="info" onClick={() => setShowShareModal(true)}>
              Chia sẻ phòng
            </Button>
          </div>

          <Button
            variant="danger"
            className="w-100 mt-3"
            onClick={() => router.push("/")}
          >
            Kết thúc cuộc gọi
          </Button>
        </div>
      </div>

      {/* Modal chia sẻ phòng */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chia sẻ phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Chia sẻ link này cho người khác để họ tham gia vào phòng:</p>
          <InputGroup>
            <Form.Control value={roomLink} readOnly />
            <Button variant="outline-secondary" onClick={copyRoomLink}>
              <FaCopy />
            </Button>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
