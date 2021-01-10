import React, { useState, useEffect, useContext, useRef } from "react";
import { Tabs, Tab, Row, Col } from "react-bootstrap";
import "./SideBar.css";
import SidebarRoom from './SideBarRoom/SidebarRoom';
import DirectRoom from './DirectRoom/DirectRoom';
import axios from "axios";
import { UserContext } from '../../../App';
import { RoomContext } from '../ChatRoom';

function SideBar({ rooms, directRooms, paramID }) {
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const [input, setInput] = useState("");
    const [chosen, setChosen] = useState("");
    const [roomFilter, setRoomFilter] = useState(rooms);

    const { roomState, roomDispatch } = useContext(RoomContext);
    const { state } = useContext(UserContext);
    const [isActive, setisActive] = useState(false);
    const myClick = useRef();

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = (c === 'x') ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    }

    const createRoom = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/rooms/new', {
            roomID: uuidv4(),
            roomName: input,
            password: password,
            participants: [state._id],
            roomHost: state._id,
        });

        // clear input
        setIsPrivate(false);
        setPassword("");
        setInput("");
        //getRooms(); // render the new room without using Pusher
    }

    //create room when someone click <SendMessage> button from user profile page
    useEffect(() => {
        const getDirectRoomInfo = async (roomID) => {
            if (roomID) {
                await axios.get(`http://localhost:5000/directrooms/check?roomID=${roomID}`)
                    .then((response) => {
                        console.log('response.data.length', response.data.length);
                        if (response.data.length === 0) { //if !data
                            console.log('response.data', response.data.length);
                            createDirectRoom(roomID);
                        }
                    })
            }
        }

        const createDirectRoom = (roomID) => {
            axios.post('http://localhost:5000/directrooms/new', {
                roomID: roomID,
                participants: state.directParticipants,
                directPics: state.directPics,
                participant: state.directParticipants,
                // .map(userID => mongoose.Types.ObjectID(userID)),
            });
        }

        if (state) {
            // if room already exist
            if (state.directRoomID !== undefined) {
                getDirectRoomInfo(state.directRoomID);
            }
        }

    }, [state]);//[state.directRoomID]);

    useEffect(() => {
        if (rooms.length !== 0) {
            setRoomFilter(rooms);
        }
    }, [rooms])

    const searchRoom = (e) => {
        setInput(e.target.value);
        setRoomFilter(
            rooms.filter(room => room.roomName.toLowerCase().includes(e.target.value)
                || room.roomHost.name.toLowerCase().includes(e.target.value))
        );
    }

    return (
        <div className="sideBarContainer">
            <div className={`sideBar ${isActive === true && "slideBar"}`} >
                <div className='sideHeader'>
                    {/* Avatar */}
                    <img alt="" style={{ width: "50px", height: "50px", borderRadius: "80px" }}
                        src={state ? state.pic : "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                    />
                    <h3 className='ml-2'>{state ? state.name : ""}</h3>
                    <div className="headerRight">
                        {/* <i className="fa fa-gg-circle mr-1 fa-lg" aria-hidden="true"></i> */}
                        {/* <i className="fa fa-commenting fa-lg" aria-hidden="true"></i> */}
                    </div>
                </div>

                <Tabs
                    className="roomMenu"
                    defaultActiveKey={paramID ? "direct" : "live"}
                    transition={false}
                >
                    <Tab className="liveRoom" eventKey="live" title="Live Room">

                        <div className="sidebarSearch">
                            <form className="searchContainer">
                                <i className="fa fa-search ml-2" aria-hidden="true"></i>
                                <input
                                    onChange={e => searchRoom(e)}
                                    value={input} type="text"
                                    placeholder="Search or Create Room" />
                                <button type="submit" onClick={createRoom}>create</button>
                            </form>
                            <div className="">
                                <input
                                    type="checkbox"
                                    className=""
                                    value={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                    checked={isPrivate} // to make sure it is clear after press enter
                                />
                                <i className="fas fa-lock ml-2" style={{color: "gray"}}></i>
                            </div>
                        </div>

                        <div className={isPrivate ? "sidebarSearch" : "notPrivate"}>
                            <form className="isPrivate">
                                <i className="fas fa-unlock-alt ml-2"></i>
                                <input
                                    onChange={e => setPassword(e.target.value)}
                                    value={password} type="text"
                                    placeholder="Enter a Room Password" />
                                <button type="submit" onClick={createRoom}>create</button>
                            </form>
                        </div>
                        <div className="createRoom" style={{ "overflow": "scroll" }}>

                            {roomFilter.map((room) => (
                                <SidebarRoom
                                    key={room.roomID}
                                    room={room}
                                    hostName={room.roomHost.name}
                                    hostPic={room.roomHost.pic}
                                    hostID={room.roomHost._id}
                                    active={room.roomID === chosen}
                                    chosenRoom={() => setChosen(room.roomID)}
                                />
                            ))}
                        </div>
                    </Tab>

                    <Tab className="directRoom" eventKey="direct" title="Direct Room" ref={myClick}>
                        <div className="createDirectRoom">
                            {/* directRoom" style={{ "flex": "10" }}> */}
                            {directRooms.map((room) => (
                                <DirectRoom
                                    key={room.roomID}
                                    room={room}
                                    active={room.roomID === chosen}
                                    chosenRoom={() => setChosen(room.roomID)}
                                    paramID={paramID}
                                    isActive={chosen}
                                />
                            ))}
                        </div>
                    </Tab>
                </Tabs>

            </div>
            <div // reponsive 
                className="navBarIcon"
                onClick={() => setisActive(!isActive)}
            >
                <i className="fas fa-bars fa-2x"></i>
            </div>
        </div>

    )
}

export default SideBar
