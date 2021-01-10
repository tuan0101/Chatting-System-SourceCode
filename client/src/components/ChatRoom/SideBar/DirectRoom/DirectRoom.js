import "./DirectRoom.css";
import React, { useContext, useEffect, useState, useRef } from "react";
import { RoomContext } from '../../ChatRoom';
import { UserContext } from '../../../../App';
import { Link } from "react-router-dom";
import axios from 'axios';

function DirectRoom({ room, chosenRoom, active, paramID }) {
    const [roomName, setRoomName] = useState("");
    const [receiverID, setReceiverID] = useState("");
    const [roomPic, setRoomPic] = useState("");
    const [notif, setNotif] = useState(0);
    const { roomState, roomDispatch } = useContext(RoomContext);
    const { state, dispatch } = useContext(UserContext);
    const myClick = useRef();

    // send RoomInfo to Chatroom by dispatch
    const getRoomInfo = async () => {

        if (room.latestMessage)
            if (room.latestMessage.receiverID === state._id)
                await updateDirectNotif(room.roomID, 0);
        chosenRoom();
        roomDispatch({
            type: 'GET_DIRECT_ROOM_INFO',
            directRoomID: room.roomID,
            directRoomName: roomName,
            directPic: roomPic,
            directReceiver: receiverID,
        });
        dispatch({
            type: "GET_MESSAGE_NOTIFICATION",
            messageNotif: 1,
            clearNotif: false,
        })
    }

    const getRoomAndPic = function (participants) {
        participants.map(participant => {
            if (participant.name !== state.name) {
                setReceiverID(participant._id);
                setRoomName(participant.name);
                setRoomPic(participant.pic);
            }
        })
    }

    useEffect(() => {
        getRoomAndPic(room.participants);
    }, [room.participants]);

    const clickMyself = () => {
        if (room.roomID === paramID) {    //(state.directRoomID === room.roomID)||     
            setTimeout(() => {
                myClick.current.click();
            }, 50);  // Add a delay because this click event trigger before the render       
        }               // which prevent to display the room Name
    }

    const getDirectNotif = async (roomID) => {

        await axios.get(`http://localhost:5000/directrooms/getnotif/${roomID}`)
            .then((response) => {
                if (response.data[0].latestMessage && response.data[0].latestMessage.receiverID === state._id) {
                // if (room.latestMessage && room.latestMessage.receiverID === state._id) {
                    if (response.data[0].directNotif !== undefined) {
                        // console.log('response.data[0].directNotif', response.data[0].directNotif);
                        setNotif(response.data[0].directNotif);
                    }
                }
            });
    }
    // const setDirectNotif = async (roomID) => {
    //             if (room.latestMessage.receiverID === state._id) {
    //                 if (room.directNotif !== undefined) {
    //                     getDirectNotif(roomID);
    //                 }

    //             }
    // }

    const updateDirectNotif = async (roomID, numNotif) => {
        await axios.post('http://localhost:5000/directrooms/updatenotif', {
            roomID: roomID,
            directNotif: numNotif,
        });
        getDirectNotif(room.roomID);
    }

    useEffect(() => {
        if (state) {
            
            getDirectNotif(room.roomID);
            clickMyself();  // new change

            // if (room.latestMessage)
            //     if (room.latestMessage.receiverID === state._id) {
            //         getDirectNotif(room.roomID);
            //     }

        }
    }, [roomState.roomNotif]);

    return (
        <Link to={`/chatroom/direct/${room.roomID}`} style={{ textDecoration: 'none' }}>
            <div
                onClick={getRoomInfo}
                className={active ? "activeDirectRoom" : "directRoom"}
                ref={myClick}
            >
                {/* Avatar */}
                <img alt="" style={{ width: "50px", height: "50px", borderRadius: "80px", border: "2px solid white" }}
                    src={roomPic ? roomPic : "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                />
                <div className="directRoomInfo ml-2">
                    <h4>{notif !== 0 ? notif : ""}</h4>
                    <h3>{roomName}</h3>
                    {room.latestMessage !== undefined ? <p>{room.latestMessage.message.length < 23 ? room.latestMessage.message : `${room.latestMessage.message.substring(0, 20)}...`}</p> : ""}
                    {room.latestMessage !== undefined ? <small>{room.latestMessage.timestamp.substring(0, 10)}</small> : ""}
                </div>
            </div>
        </Link>

    )
}

export default DirectRoom
