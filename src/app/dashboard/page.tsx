"use client";


import { useEffect, useRef, useState , useMemo } from "react";


import {
 addDoc,
 collection,
 deleteDoc,
 doc,
 getDoc,
 onSnapshot,
 orderBy,
 query,
 serverTimestamp,
 setDoc,
 updateDoc,
} from "firebase/firestore";


import {
 onAuthStateChanged,
 signOut,
} from "firebase/auth";


import {
 auth,
 db,
} from "@/lib/firebase";


import {
 Send,
 Moon,
 Sun,
 Trash2,
 Pencil,
 Pin,
 LogOut,
 MoreVertical,
} from "lucide-react";


export default function DashboardPage() {


 const [message, setMessage] =
   useState("");


 const [messages, setMessages] =
   useState<any[]>([]);
const [unreadCount, setUnreadCount] =
  useState(0);

 const [user, setUser] =
   useState<any>(null);


 const [roomId, setRoomId] =
   useState("");
   const [joinRoomInput, setJoinRoomInput] = useState("");
const [roomName, setRoomName] = useState("");
const [isRoomLocked, setIsRoomLocked] = useState(false);

 const [typingUser, setTypingUser] =
   useState("");


 const [onlineStatus, setOnlineStatus] =
   useState("⚫ Offline");
const [sharedStatus, setSharedStatus] =
  useState("💤 Waiting for connection...");
  const [lastSeenText, setLastSeenText] =
  useState("");
  const [sharedSong, setSharedSong] = useState<string | null>(null);

 const [fileUrl, setFileUrl] =
   useState("");


 const [fileType, setFileType] =
   useState("");


 const [recording, setRecording] =
   useState(false);


 const [darkMode, setDarkMode] =
   useState(true);


 const [search, setSearch] =
   useState("");


 const [editingId, setEditingId] =
   useState("");
   const [myNickname, setMyNickname] =
  useState("");

const [partnerNickname, setPartnerNickname] =
  useState("");


 const [editingText, setEditingText] =
   useState("");


 const [replyTo, setReplyTo] =
   useState<any>(null);


 const [profilePic, setProfilePic] =
   useState("");


 const [showPinned, setShowPinned] =
   useState(false);
   const [showMenu, setShowMenu] = useState(false);
const [showEmoji, setShowEmoji] = useState(false);

const emojis = ["😂", "❤️", "🔥", "👍", "😭", "😈", "🥶", "💀", "✨", "🥳"];
const [gameMessage, setGameMessage] = useState<string | null>(null);
const [badges, setBadges] = useState<string[]>([]);
const [puzzleMode, setPuzzleMode] = useState(false);
const [giftMode, setGiftMode] = useState(false);
// 🧩 Puzzle Mode: scramble function
const scramble = (text: string) => {
  if (!text) return "";
  

  return text
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

 const fileRef =
   useRef<HTMLInputElement>(null);
const chatEndRef = useRef<HTMLDivElement>(null);
const lastMessageCount = useRef(0);

 const mediaRecorderRef =
   useRef<any>(null);


 const audioChunksRef =
   useRef<any[]>([]);


 // AUTH
 useEffect(() => {


   const unsub =
     onAuthStateChanged(
       auth,
       async (u) => {


         if (!u) {


           window.location.href =
             "/login";


           return;
         }


         setUser(u);


         const savedPic =
           localStorage.getItem(
             "vyra-profile-pic"
           );


         if (savedPic) {


           setProfilePic(savedPic);
         }


         if (!u.email) return;


         const params =
           new URLSearchParams(
             window.location.search
           );


         const invitedRoom =
           params.get("room");


         const finalRoom =
  invitedRoom ||
  `solo-${u.uid}`;


         setRoomId(finalRoom);


         const roomRef = doc(
           db,
           "rooms",
           finalRoom
         );


         const snap =
           await getDoc(roomRef);


         let users: string[] = [];


         if (snap.exists()) {


           users =
             snap.data().users || [];
         }


if (!users.includes(u.email)) {

  // 🚫 LOCK ROOM AFTER 2 USERS
  if (users.length >= 2) {

    alert(
      "🔒 This Vyra room is locked.\nOnly the original 2 members can enter."
    );

    await signOut(auth);

    window.location.href = "/login";

    return;
  }

  users.push(u.email);

  await setDoc(
    roomRef,
    { users },
    { merge: true }
  );
}


         await setDoc(
           doc(
             db,
             "status",
             u.email
           ),
           {
             online: true,
             lastSeen:
               serverTimestamp(),
           }
         );
       }
     );
window.addEventListener(
  "beforeunload",
  async () => {

    if (!auth.currentUser?.email) return;

    await setDoc(
      doc(
        db,
        "status",
        auth.currentUser.email
      ),
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }
);

   return () => unsub();


 }, []);


 // ONLINE STATUS
useEffect(() => {
  if (!roomId || !user?.email) return;

  const roomRef = doc(db, "rooms", roomId);

  const loadPartnerStatus = async () => {
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return;

    const users = roomSnap.data().users || [];

    const partner = users.find(
      (u: string) => u !== user.email
    );

    if (!partner) return;

    return onSnapshot(
      doc(db, "status", partner),
      (snap) => {
        const data = snap.data();

        if (!data) return;

        if (data.online) {
          setOnlineStatus("🟢 Online");
        } else {
          setOnlineStatus("🕒 Last seen recently");
        }
      }
    );
  };

  let unsubscribePartner: any;

  loadPartnerStatus().then((unsub) => {
    unsubscribePartner = unsub;
  });

  return () => {
    if (unsubscribePartner)
      unsubscribePartner();
  };
}, [roomId, user]);
useEffect(() => {

  if (!roomId || !user?.email)
    return;

  return onSnapshot(
    doc(db, "rooms", roomId),
    (snap) => {

      const data =
        snap.data();

      if (!data) return;

      const users =
        data.users || [];

      const nicknames =
        data.nicknames || {};

      const partner =
        users.find(
          (u: string) =>
            u !== user.email
        );

      setMyNickname(
        partner
          ? nicknames[partner] || ""
          : ""
      );

      setPartnerNickname(
        nicknames[user.email] ||
          ""
      );
    }
  );
}, [roomId, user]);

 // LOAD MESSAGES
 useEffect(() => {


   if (!roomId) return;


   const q = query(
     collection(
       db,
       "rooms",
       roomId,
       "messages"
     ),
     orderBy("createdAt")
   );


   const unsub =
     onSnapshot(q, async (snap) => {


       const data =
         snap.docs.map((d) => ({
           id: d.id,
           ...d.data(),
         }));


       setMessages(data);


      
data.forEach(
  async (msg: any) => {
    if (
      msg.sender !== user?.email &&
      !msg.seen
    ) {
      await updateDoc(
        doc(
          db,
          "rooms",
          roomId,
          "messages",
          msg.id
        ),
        {
          seen: true,
        }
      );
    }
  }
);
});

   return () => unsub();


 }, [roomId, user]);


 // TYPING
 useEffect(() => {


   if (!roomId) return;


   const unsub =
     onSnapshot(
       doc(
         db,
         "typing",
         roomId
       ),
       (snap) => {


         const data =
           snap.data();


         if (
           data?.typing &&
           data?.user !==
             user?.email
         ) {


           setTypingUser(
             data.user
           );


         } else {


           setTypingUser("");
         }
       }
     );


   return () => unsub();


 }, [roomId, user]);
 useEffect(() => {
  if (!user?.email) return;

  const handleVisibility = async () => {
    await setDoc(
      doc(db, "status", user.email),
      {
        online:
          document.visibilityState === "visible",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  };
handleVisibility();
  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );
  };
}, [user]);
useEffect(() => {
  const handleFocus = () => {
    setUnreadCount(0);
  };

  window.addEventListener(
    "focus",
    handleFocus
  );

  return () => {
    window.removeEventListener(
      "focus",
      handleFocus
    );
  };
}, []);
useEffect(() => {
  document.title =
    unreadCount > 0
      ? `(${unreadCount}) Vyra`
      : "Vyra";
}, [unreadCount]);
const previousMessageCount = useRef(0);

useEffect(() => {
  if (messages.length > previousMessageCount.current) {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // 🔔 Play sound for new incoming messages
if (
  messages.length > lastMessageCount.current &&
  messages[messages.length - 1]?.sender !== user?.email
) {
  notificationSound.current?.play();

  if (
    document.visibilityState !== "visible"
  ) {
    setUnreadCount(
      (prev) => prev + 1
    );
  }
}

  lastMessageCount.current = messages.length;
  previousMessageCount.current = messages.length;
}, [messages, user]);
   // CLOUDINARY
 const uploadFile =
   async (
     file: File
   ) => {


     const formData =
       new FormData();


     formData.append(
       "file",
       file
     );


     formData.append(
       "upload_preset",
       "vyrachat"
     );


     const res =
       await fetch(
         "https://api.cloudinary.com/v1_1/dtgtw9wpg/auto/upload",
         {
           method: "POST",
           body: formData,
         }
       );


     const data =
       await res.json();


     return (
       data.secure_url || ""
     );
   };


 // FILE
 const handleFile =
   async (
     e: React.ChangeEvent<HTMLInputElement>
   ) => {


     const file =
       e.target.files?.[0];


     if (!file) return;


     const url =
       await uploadFile(file);


     setFileUrl(url);
     setFileType(file.type);
   };


 // RECORDING
 const startRecording =
   async () => {


     const stream =
       await navigator.mediaDevices.getUserMedia({
         audio: true,
       });


     const mediaRecorder =
       new MediaRecorder(stream);


     mediaRecorderRef.current =
       mediaRecorder;


     audioChunksRef.current =
       [];


     mediaRecorder.ondataavailable =
       (event) => {


         audioChunksRef.current.push(
           event.data
         );
       };


     mediaRecorder.onstop =
       async () => {


         const audioBlob =
           new Blob(
             audioChunksRef.current,
             {
               type:
                 "audio/mp3",
             }
           );


         const audioFile =
           new File(
             [audioBlob],
             "voice.mp3",
             {
               type:
                 "audio/mp3",
             }
           );


         const url =
           await uploadFile(
             audioFile
           );


         setFileUrl(url);
         setFileType("audio/mp3");


         alert(
           "Voice Note Ready ✅"
         );
       };


     mediaRecorder.start();


     setRecording(true);
   };


 const stopRecording =
   () => {


     mediaRecorderRef.current.stop();


     setRecording(false);
   };

// ROOM SYSTEM
const createPrivateRoom = async () => {
  if (!user?.email) return;

  const randomCode =
    "VYRA-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  const finalRoomName =
    roomName.trim() || "Vyra Space 💖";

  await setDoc(
    doc(db, "rooms", randomCode),
    {
      roomName: finalRoomName,
      users: [user.email],
      nicknames: {},
      locked: false,
      createdBy: user.email,
      createdAt: serverTimestamp(),
    }
  );

  setRoomId(randomCode);

  const inviteLink =
    `${window.location.origin}/dashboard?room=${randomCode}`;

  navigator.clipboard.writeText(inviteLink);

  alert(
    `Permanent Room Created 💖\n\nInvite link copied:\n${inviteLink}`
  );
};

const joinPrivateRoom = () => {
  if (!joinRoomInput.trim()) return;

  const finalRoom =
    joinRoomInput
      .trim()
      .toUpperCase();

  setRoomId(finalRoom);

  alert(`Joined ${finalRoom} ✨`);

  setJoinRoomInput("");
};
 // SEND
 const sendSharedSong = async (url: string) => {
  setSharedSong(url);

  await addDoc(
    collection(db, "rooms", roomId, "messages"),
    {
      text: "🎵 Shared a song",
      song: url,
      sender: user?.email,
      createdAt: serverTimestamp(),
      pinned: false,
    }
  );
};
 const sendMessage = async () => {
  if (!message.trim() && !fileUrl) return;

  const messageData: any = {
    text: message || "",
    sender: user?.email || "",
    createdAt: serverTimestamp(),
    reaction: null,
    pinned: false,
    seen: false,
    replyTo: replyTo || null,

    isGift: giftMode,
opened: false,
  };

  if (fileType.startsWith("image")) {
    messageData.image = fileUrl;
  }

  if (fileType.startsWith("video")) {
    messageData.video = fileUrl;
  }

  if (fileType.startsWith("audio")) {
    messageData.audio = fileUrl;
  }

  await addDoc(
    collection(db, "rooms", roomId, "messages"),
    messageData
  );

  const newBadges = [...badges];

  if (!newBadges.includes("⚡ Fast Replier")) {
    newBadges.push("⚡ Fast Replier");
  }

  if (new Date().getHours() >= 23) {
    newBadges.push("🌙 Night Owl");
  }

  if (message.length > 50) {
    newBadges.push("🧠 Deep Talker");
  }

  setBadges(newBadges);

  setMessage("");
  setFileUrl("");
  setFileType("");
  setReplyTo(null);
  setGiftMode(false);

  await setDoc(doc(db, "typing", roomId), {
    typing: false,
    user: user?.email || "",
  });
};

 // TYPING
 const handleTyping =
   async (
     value: string
   ) => {


     setMessage(value);


     await setDoc(
       doc(
         db,
         "typing",
         roomId
       ),
       {
         typing:
           value.length > 0,
         user:
           user?.email || "",
       }
     );
   };


 // REACTION
 const react =
   async (
     id: string,
     currentReaction:
       | string
       | null,
     emoji: string
   ) => {


     await updateDoc(
       doc(
         db,
         "rooms",
         roomId,
         "messages",
         id
       ),
       {
         reaction:
           currentReaction ===
           emoji
             ? null
             : emoji,
       }
     );
   };


 // DELETE
 const deleteMessage =
   async (
     id: string
   ) => {


     await deleteDoc(
       doc(
         db,
         "rooms",
         roomId,
         "messages",
         id
       )
     );
   };


 // EDIT
 const saveEdit =
   async (
     id: string
   ) => {


     await updateDoc(
       doc(
         db,
         "rooms",
         roomId,
         "messages",
         id
       ),
       {
         text:
           editingText,
       }
     );


     setEditingId("");
     setEditingText("");
   };
     // PIN
 const pinMessage =
   async (
     id: string,
     current: boolean
   ) => {


     await updateDoc(
       doc(
         db,
         "rooms",
         roomId,
         "messages",
         id
       ),
       {
         pinned:
           !current,
       }
     );
   };

const startGame = () => {
 const games = [
  "🔥 Truth or Dare: send a secret emoji only you understand",
  "😂 Send your last used emoji only",
  "🧠 Guess what your partner is doing RIGHT NOW",
  "😈 Speak without vowels for 3 messages",
  "⚡ Reply using only song lyrics",
  "🥶 Type with eyes closed",
  "💀 Send your worst pickup line",
  "❤️ Describe them in 3 words",
  "🎭 Pretend you're strangers meeting first time",
  "👀 Send the most suspicious message possible",
  "🌙 Midnight challenge: deepest thought wins",
];

  setGameMessage(games[Math.floor(Math.random() * games.length)]);
};
 const filteredMessages = useMemo(() => {
  return messages.filter((msg) =>
    msg.text?.toLowerCase().includes(search.toLowerCase())
  );
}, [messages, search]);
// 🔔 Sound Effect
const notificationSound = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  notificationSound.current = new Audio("/sounds/message.mp3");
}, []);


 return (


   <main
  className={`h-screen w-full overflow-x-hidden flex flex-col transition-all ${
       darkMode
         ? "bg-black text-white"
         : "bg-white text-black"
     }`}
   >


     {/* HEADER */}
     <header className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="flex flex-col md:flex-row gap-2 items-center">

       <div className="flex items-center gap-3">


         <img
           src={
             profilePic ||
             `https://ui-avatars.com/api/?name=${
               user?.email || "V"
             }`
           }
           alt=""
           className="w-12 h-12 rounded-full object-cover"
         />


         <div>


           <h1 className="text-xl font-bold">
  {partnerNickname || "You"}
  {" 💖 "}
  {myNickname || "Partner"}
</h1>


           <p className="text-green-400 text-sm">
             {onlineStatus}
           </p>
  <p className="text-xs text-purple-300">
  {sharedStatus}
</p>

<div className="flex gap-2 flex-wrap mt-2">
  {badges.map((b, i) => (
    <span
      key={i}
      className="text-xs bg-white/10 px-2 py-1 rounded-xl"
    >
      {b}
    </span>
  ))}
</div>

         </div>


       </div>


<div className="relative">

  <button
    onClick={() =>
      setShowMenu(!showMenu)
    }
    className="p-2 rounded-full bg-white/10"
  >
    <MoreVertical size={22} />
  </button>

  {showMenu && (
    <div className="absolute right-0 top-12 bg-zinc-900 border border-white/10 rounded-xl w-52 p-2 z-50 flex flex-col">

      <button
        onClick={() => {
          setShowPinned(!showPinned);
          setShowMenu(false);
        }}
        className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
      >
        📌 Pinned Messages
      </button>

      <button
        onClick={() => {
          startGame();
          setShowMenu(false);
        }}
        className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
      >
        🎮 Play Game
      </button>

      <button
        onClick={() => {
          setShowEmoji(!showEmoji);
          setShowMenu(false);
        }}
        className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
      >
        😊 Emoji Picker
      </button>

      <button
        onClick={() => {
          setDarkMode(!darkMode);
          setShowMenu(false);
        }}
        className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
<button
  onClick={() => {
    const name = prompt("Room Name 💖");

    if (!name) return;

    setRoomName(name);

    setTimeout(() => {
      createPrivateRoom();
    }, 100);
  }}
  className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
>
  🔐 Create Room
</button>

<button
  onClick={() => {
    const code = prompt("Enter Room Code");

    if (!code) return;

    setJoinRoomInput(code);

    setTimeout(() => {
      joinPrivateRoom();
    }, 100);
  }}
  className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
>
  🚪 Join Room
</button>
<button
  onClick={async () => {

    const nickname =
      prompt(
        "What do you call your partner? 💖"
      );

    if (!nickname) return;

    const roomSnap =
      await getDoc(
        doc(
          db,
          "rooms",
          roomId
        )
      );

    const current =
      roomSnap.data()?.nicknames || {};

    await setDoc(
      doc(
        db,
        "rooms",
        roomId
      ),
      {
        nicknames: {
          ...current,
          [user.email]:
            nickname,
        },
      },
      { merge: true }
    );
  }}
  className="text-left px-3 py-2 hover:bg-white/10 rounded-lg"
>
  🏷 Set Partner Nickname
</button>
      <button
        onClick={async () => {
          await signOut(auth);
          window.location.href = "/login";
        }}
        className="text-left px-3 py-2 hover:bg-red-500 rounded-lg"
      >
        🚪 Logout
      </button>

    </div>
  )}

</div>


       </div>


     </header>


     {/* PINNED MESSAGES */}
     {showPinned && (


       <div className="p-4 border-b border-yellow-500/30 bg-yellow-500/10">


         <div className="flex justify-between items-center mb-3">


           <h2 className="font-bold text-lg">


             📌 Pinned Messages


           </h2>


           <button
             onClick={() =>
               setShowPinned(false)
             }
             className="bg-red-500 px-3 py-1 rounded-lg"
           >
             Close
           </button>


         </div>


         <div className="space-y-2 max-h-60 overflow-y-auto">


           {messages
             .filter(
               (msg: any) =>
                 msg.pinned
             )
             .length === 0 && (


             <p className="text-gray-400">


               No pinned messages yet


             </p>
           )}


           {messages
             .filter(
               (msg: any) =>
                 msg.pinned
             )
             .map((msg: any) => (


               <div
                 key={msg.id}
                 className="bg-black/20 p-3 rounded-xl"
               >


                 <p className="text-xs opacity-70 mb-1">


                   {msg.sender}


                 </p>


{msg.isGift && !msg.opened ? (
  <div
    onClick={async () => {
      await updateDoc(
        doc(
          db,
          "rooms",
          roomId,
          "messages",
          msg.id
        ),
        {
          opened: true,
        }
      );
    }}
    className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-yellow-500 text-center shadow-lg cursor-pointer animate-pulse"
  >
    <div className="text-4xl">🎁</div>

    <p className="font-bold mt-2">
      Tap to open surprise
    </p>
  </div>
) : (
  msg.text && (
    <p
      onClick={() => setPuzzleMode(!puzzleMode)}
      className="cursor-pointer"
    >
      {puzzleMode
        ? msg.text
        : scramble(msg.text)}
    </p>
  )
)}


               </div>
             ))}


         </div>


       </div>
     )}
{gameMessage && (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white p-4 rounded-xl border border-white/20 z-50">
    <p>{gameMessage}</p>

    <button
      className="mt-2 bg-red-500 px-3 py-1 rounded"
      onClick={() => setGameMessage(null)}
    >
      Close
    </button>
  </div>
)}

     {/* SEARCH */}
     <div className="p-3">


       <input
         value={search}
         onChange={(e) =>
           setSearch(
             e.target.value
           )
         }
         placeholder="Search messages..."
         className="w-full p-3 rounded-xl bg-white/10 outline-none"
       />


     </div>


     {/* CHAT */}
     <section className="flex-1 overflow-y-auto p-4 space-y-4">


       {filteredMessages.map(
         (msg: any) => (


           <div
             key={msg.id}
             className={`max-w-[85%] md:max-w-xs p-3 rounded-2xl break-words ${
               msg.sender ===
               user?.email
                 ? "ml-auto bg-pink-500"
                 : "bg-white/10"
             }`}
           >


             {msg.pinned && (
               <p>
                 📌 Pinned
               </p>
             )}


             {msg.replyTo && (


               <div className="bg-black/20 p-2 rounded-lg mb-2 text-sm">


                 Replying to:
                 {" "}
                 {msg.replyTo.text}


               </div>
             )}
{msg.song && (
  <div className="mt-2">
    <audio controls src={msg.song} className="w-full" />
    <p className="text-xs text-green-400">🎧 Listening together</p>
  </div>
)}

             <p className="text-[10px] opacity-50 mb-2">
  {msg.createdAt?.toDate
    ? msg.createdAt
        .toDate()
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
    : ""}
</p>


{editingId === msg.id ? (

  <div className="flex flex-col gap-2">

    <input
      value={editingText}
      onChange={(e) =>
        setEditingText(e.target.value)
      }
      className="p-2 rounded-lg text-black"
    />

    <button
      onClick={() =>
        saveEdit(msg.id)
      }
      className="bg-green-500 p-2 rounded-lg"
    >
      Save
    </button>

  </div>

) : (

  <>

    {msg.isGift && !msg.opened ? (

      <div
        onClick={async () => {
          await updateDoc(
            doc(
              db,
              "rooms",
              roomId,
              "messages",
              msg.id
            ),
            {
              opened: true,
            }
          );
        }}
        className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-yellow-500 text-center shadow-lg cursor-pointer animate-pulse"
      >

        <div className="text-4xl">
          🎁
        </div>

        <p className="font-bold mt-2">
          Tap to open surprise
        </p>

      </div>

    ) : (

      msg.text && (

        <p
          onClick={() =>
            setPuzzleMode(!puzzleMode)
          }
          className="cursor-pointer"
        >
          {puzzleMode
            ? msg.text
            : scramble(msg.text)}
        </p>

      )

    )}

  </>

)}


             {msg.image && (
               <img
                 src={msg.image}
                 alt=""
                 className="rounded-xl mt-2"
               />
             )}


             {msg.video && (
               <video
                 controls
                 className="rounded-xl mt-2"
               >
                 <source
                   src={msg.video}
                 />
               </video>
             )}


             {msg.audio && (
               <audio
                 controls
                 className="mt-2 w-full"
               >
                 <source
                   src={msg.audio}
                 />
               </audio>
             )}
<div className="flex justify-between items-center mt-2 text-xs opacity-70">

  <span>
    {msg.createdAt?.toDate
      ? msg.createdAt
          .toDate()
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
      : ""}
  </span>

  {msg.sender === user?.email && (
    <span>
      {msg.seen
        ? "✓✓ Seen"
        : "✓ Sent"}
    </span>
  )}

</div>


             {msg.reaction && (
               <p className="mt-2 text-xl">
                 {msg.reaction}
               </p>
             )}


             <div className="flex gap-2 mt-2 flex-wrap">


               {[
                 "❤️",
                 "😂",
                 "🔥",
                 "👍",
               ].map(
                 (emoji) => (


                   <button
                     key={emoji}
                     onClick={() =>
                       react(
                         msg.id,
                         msg.reaction,
                         emoji
                       )
                     }
                   >
                     {emoji}
                   </button>
                 )
               )}


               <button
                 onClick={() =>
                   setReplyTo(msg)
                 }
               >
                 ↩️
               </button>


               <button
                 onClick={() => {


                   setEditingId(
                     msg.id
                   );


                   setEditingText(
                     msg.text
                   );
                 }}
               >
                 <Pencil size={16} />
               </button>


               <button
                 onClick={() =>
                   deleteMessage(
                     msg.id
                   )
                 }
               >
                 <Trash2 size={16} />
               </button>


               <button
                 onClick={() =>
                   pinMessage(
                     msg.id,
                     msg.pinned
                   )
                 }
               >
                 <Pin size={16} />
               </button>


             </div>


           </div>
         )
       )}

<div ref={chatEndRef} />
     </section>


     {/* REPLY BAR */}
     {replyTo && (
       <div className="px-4 py-2 bg-pink-500 text-white flex justify-between">
         <p>
           Replying to: {replyTo.text}
         </p>
         <button onClick={() => setReplyTo(null)}>
           ✖
         </button>
       </div>
     )}


     {/* INPUT */}
     <footer className="p-4 border-t border-white/10 flex flex-col gap-3">
     {typingUser && (
  <p className="text-xs text-purple-400 px-2">
    ✍️ {typingUser} is typing...
  </p>
)}

{showEmoji && (
  <div className="flex flex-wrap gap-2 p-2 bg-white/10 rounded-xl">
    {emojis.map((e) => (
      <button
        key={e}
        onClick={() => setMessage((prev) => prev + e)}
        className="text-xl"
      >
        {e}
      </button>
    ))}
  </div>
)}
       <input
         value={message}
         onChange={(e) =>
           handleTyping(e.target.value)
         }
         placeholder="Type message..."
         className="p-3 rounded-xl bg-white/10 outline-none"
       />


       <div className="flex gap-2 flex-wrap">


         <button
           onClick={() =>
             fileRef.current?.click()
           }
           className="bg-white/10 px-4 py-2 rounded-xl"
         >
           Upload
         </button>


         <input
           type="file"
           hidden
           ref={fileRef}
           onChange={handleFile}
         />


         {!recording ? (
           <button
             onClick={startRecording}
             className="bg-white/10 px-4 py-2 rounded-xl"
           >
             🎤 Start
           </button>
         ) : (
           <button
             onClick={stopRecording}
             className="bg-red-500 px-4 py-2 rounded-xl"
           >
             Stop
           </button>
         )}
         <button
  onClick={() =>
    sendSharedSong("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
  }
  className="bg-green-500 px-4 py-2 rounded-xl"
>
  🎵 Song
  
</button>
<button
  onClick={() => setShowEmoji(!showEmoji)}
  className="bg-white/10 px-4 py-2 rounded-xl"
>
  😊
</button>

<button
  onClick={() => setGiftMode(!giftMode)}
  className={`px-4 py-2 rounded-xl ${
    giftMode
      ? "bg-yellow-500 text-black"
      : "bg-white/10"
  }`}
>
  🎁
</button>


         <button
           onClick={sendMessage}
           className="bg-pink-500 px-5 rounded-xl"
         >
           <Send />
         </button>


       </div>


     </footer>


   </main>
 );
}