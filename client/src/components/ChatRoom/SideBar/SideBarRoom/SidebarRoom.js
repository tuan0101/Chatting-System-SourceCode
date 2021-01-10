import "./SidebarRoom.css";
import React, { useContext, useState, useRef, useEffect } from "react";
import { RoomContext } from '../../ChatRoom';
import { UserContext } from '../../../../App';
import axios from "axios";
import { Link } from "react-router-dom";


function SidebarRoom({ room, chosenRoom, active, hostName, hostPic, hostID }) {
    const { roomDispatch } = useContext(RoomContext);
    const { state, dispatch } = useContext(UserContext);
    const [toggleAlert, setToggleAlert] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const myInput = useRef();
    const myClick = useRef();

    // const clickMyself= ()=>{
    //     if(state.directRoomID === room.roomName){
    //         myClick.current.click();
    //     }

    // }

    //useEffect(()=>clickMyself(), []);

    const getRoomInfo = () => {
        roomDispatch({
            type: 'GET_ROOM_INFO',
            roomID: room.roomID,
            roomName: room.roomName,
            hostName: hostName,
            hostPic: hostPic,
            hostID: hostID,
            participants: room.participants,
        });
        chosenRoom();
    }

    // private room
    const askPassword = () => {
        if (room.password) {
            if (isRegistered) {
                getRoomInfo();
            } else { // is private
                setToggleAlert(!toggleAlert); // promt password input
                myInput.current.focus(); // => go to verify Password
            }
        } else {
            //setIsPrivate(false);
            getRoomInfo();
            updateParticipant(); // update for public room
        }

    }

    // press enter => compare password, set public, show info
    const verifyPassword = (e) => {
        e.preventDefault();
        if (passwordInput === room.password) { // successful
            setPasswordInput("");
            getRoomInfo();
            updateParticipant();
        }
        else
            alert("Your password is incorrect, please try again!!");
        setPasswordInput("");
    }

    // update the new participant if room not include
    const updateParticipant = async () => {
        let currentPars = [];
        room.participants.map(user => {
            currentPars.push(user._id);
        })
        if (!isRegistered) {
            await axios.post('http://localhost:5000/rooms/participants', {
                roomID: room.roomID,
                participants: [...currentPars, state._id],
            });
        }
    }

    useEffect(() => {
        //setIsRegistered(room.participants.includes(state._id));
        setIsRegistered(room.participants.filter(user => user._id === state._id).length > 0);
    }, [room.participants])

    return (
        <Link to={`/chatroom`} style={{ textDecoration: 'none' }}>
            <div
                onClick={askPassword}
                className={active ? "activeRoom" : "sidebarRoom"}
                ref={myClick}
            >
                {/* Avatar */}
                <img alt="" style={{ width: "50px", height: "50px", borderRadius: "80px", border: "2px solid white" }}
                    src={hostPic ? hostPic : "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                />
                <div className="roomInfo ml-2">
                    {room.password ? <i className="fas fa-lock"></i> : ""}
                    <h3>{room.roomName.length < 20? room.roomName : `${room.roomName.substring(0, 17)}..`} </h3>
                    {(isRegistered && room.latestMessage !== undefined) ? <p>{room.latestMessage.message.length < 23 ? room.latestMessage.message : `${room.latestMessage.message.substring(0, 20)}...`}</p> : ""}
                    {(isRegistered && room.latestMessage !== undefined) ? <small>{room.latestMessage.timestamp.substring(0, 10)}</small> : ""}

                </div>

                <form className="passwordPromt">
                    <input
                        type="text"
                        ref={myInput}
                        className={toggleAlert ? "activeInput" : ""}
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        placeholder=" Password Please!!" />
                    <button type="submit" onClick={verifyPassword}>create</button>
                </form>
                {/* <> {isPrivate? displayAlert() : ""} </> */}
            </div>
        </Link>
    )
}

export default SidebarRoom
