import React, { useState, useEffect, useReducer, useContext } from "react";
import Chat from "./Chat/Chat";
import SideBar from "./SideBar/SideBar";
import "./ChatRoom.css";
import Pusher from 'pusher-js'
import axios from 'axios';
import { useParams } from "react-router-dom";
import { UserContext } from '../../App';

export const RoomContext = React.createContext();
export default function ChatRoom() {
  const [rooms, setRooms] = useState([]);
  const [directRooms, setDirectRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState([]);
  const [roomID, setRoomID] = useState([]);
  const [endTime, setEndTime] = useState(0);
  const { state, dispatch } = useContext(UserContext);
  const { paramID } = useParams();


  const initialState = {
    roomID: "",
    roomName: "",
    hostName: "",
    hostID: "",
    directRoomID: "",
  }
  const [roomState, roomDispatch] = useReducer(roomReducer, initialState);

  useEffect(() => {
    if (paramID)
      setRoomID(paramID);
  }, [paramID])

  function roomReducer(state, action) {

    switch (action.type) {

      case 'GET_ROOM_INFO':
        setRoomID(action.roomID); // get the roomID from SideBarRoom onclick
        return {
          roomID: action.roomID,
          roomName: action.roomName,
          hostName: action.hostName,
          hostPic: action.hostPic,
          hostID: action.hostID,
          participants: action.participants,
        }
      case 'GET_DIRECT_ROOM_INFO':
        setRoomID(action.directRoomID); // get the roomID from DirectRoom onclick
        return {
          //...state,
          directRoomID: action.directRoomID,
          directRoomName: action.directRoomName,
          directPic: action.directPic,
          directReceiver: action.directReceiver,
        }
      case 'GET_ROOM_NOTIFICATION':
        return {
          //...state,
          roomNotif: action.roomNotif,
        }
      default: return;
    }
  }

  const getRooms = async () => {
    await axios.get('http://localhost:5000/rooms/sync')
      .then((response) => {
        setRooms(response.data);
      })
      .catch((err) => {
        console.log(err);
      })

  };

  // get all direct room for this user
  const getDirectRooms = async (userID) => {
    if (userID)
      await axios.get(`http://localhost:5000/directrooms/sync?userID=${userID}`)
        .then((response) => {
          setDirectRooms(response.data);
          //console.log('set direct room');
        })
        .catch((err) => {
          console.log(err);
        })
  };

  useEffect(() => {
    if (state && state._id) {
      getDirectRooms(state._id);
      // render when generating direct message for the first time
      if (state.directRoomID) {
        setTimeout(() => {
          getDirectRooms(state._id);
        }, 100)
      }
    }

  }, [state, newMessage])


  // Get all the messages belong to this roomID
  // can be either Live Rroom or Direct Room
  const getRoomMessages = (roomID) => {
    if (roomID) {
      axios.get(`http://localhost:5000/messages/sync?roomID=${roomID}`) // roomID
        .then((response) => {
          setMessages(response.data);
        })
        .catch((err) => {
          console.log(err);
        })
    }
  }

  //Update messages every time click a new room
  useEffect(() => {
    getRoomMessages(roomID);

  }, [roomID, newMessage])

  /**************************NOTIFICATION *******************/
  // 1. get update when receiver click a new message
  useEffect(() => {
    if (state)
      getDirectRooms(state._id); // also change directRooms
  }, [roomState])                // activate step 2.

  // 2. then send notif to Navbar
  useEffect(() => {
    setMessageNotif(directRooms);
  }, [directRooms, newMessage])

  const setMessageNotif = (directRooms) => {
    let messageNotif = 0;
    if (directRooms) {
      directRooms.map(room => {
        if (room.latestMessage)
          if (state._id && room.latestMessage.receiverID === state._id) {
            messageNotif += room.directNotif;
          }
      })

    }
  }


  /* prevent trigger NOTIF twice when opening two servers */
  useEffect(() => {
    let start = performance.now();
    let _time = start - endTime;
    console.log('_time', _time);
    setEndTime(start);
    if (_time > 150) {
      if (state && (state._id !== undefined)) {
        if (newMessage.sender === state._id) // to run only once
          notifyReceiver(newMessage);
        if (newMessage.receiverID === state._id) {
          setNotif(newMessage);
        }
      }
    }
  }, [newMessage])

  // Message notifications
  const notifyReceiver = (newMessage) => { // from sender
    if (roomID === paramID) { // sending DM
      //console.log('newMessage.receiverID', newMessage.receiverID);
      //updateMessageNotif(newMessage.receiverID);
      updateDirectNotif(newMessage.roomID, 1);
    }
  }

  // trigger direct room
  const setNotif = (newMessage) => {
    roomDispatch({
      type: "GET_ROOM_NOTIFICATION",
      roomNotif: newMessage,
    })
  }

  const updateMessageNotif = async (userID, totalNotif) => {
    await axios.post('http://localhost:5000/user/updatenotif', {
      userID: userID,
      messageNotif: totalNotif,
    })
  }

  const updateDirectNotif = async (roomID, numNotif) => {
    await axios.post('http://localhost:5000/directrooms/updatenotif', {
      roomID: roomID,
      directNotif: numNotif,
    })
  }

  useEffect(() => {
    getRooms();
    //getDirectRooms();
    // this pusher is created only once compared to when creating outside the function
    const pusher = new Pusher('cb908631b197c8834d00', { cluster: 'us2' });

    const mesChannel = pusher.subscribe('messages'); // messages channel
    mesChannel.bind('newMessage', (newMessage) => {
      // This line is much more cleaner, but
      // it's going to render for the room that doesn't even contain this message
      //setMessages(messages => [...messages, newMessage]);

      // An alternative way is to use pusher with dependency in useEffect(), but
      // it will subscribe and ubsubscribe channel all the time => heavy performance

      // instead save the new message first, then make it becomes an dependency in useEffect
      // the setMessage() will be updated again every time the newMessage changes
      setTimeout(() => {
        setNewMessage(newMessage);
      }, 50);

    });

    const roomChannel = pusher.subscribe('liveRooms'); // live room channel
    roomChannel.bind('newRoom', (newRoom) => {
      getRooms();
    });

    roomChannel.bind('newLastMessage', (newLastMessage) => {
      getRooms();
    });

    roomChannel.bind('delete', (roomDelete) => {
      getRooms();

    });

    const directChannel = pusher.subscribe('directRooms'); // live room channel
    directChannel.bind('deleteDR', (roomDelete) => {
      state && getDirectRooms(state._id);
    });

    return () => {
      pusher.unsubscribe('liveRooms');
      pusher.unsubscribe('messages');
      pusher.unsubscribe('directRooms');
      setTimeout(() => {
        pusher.disconnect();
      }, 1000) // delay 1s to avoid "Websocket already closed" error
    }
  }, []);


  return (
    <div className="chatRoom">
      <RoomContext.Provider value={{ roomState, roomDispatch }}>
        <SideBar
          rooms={rooms}                             // pass rooms info to SideBar  
          directRooms={directRooms}
          paramID={paramID}
        />
        <Chat
          messages={messages} roomID={roomID} paramID={paramID} hostID={roomState.hostID}
          participants={roomState.participants}
        />
      </RoomContext.Provider>
    </div>
  );
}


