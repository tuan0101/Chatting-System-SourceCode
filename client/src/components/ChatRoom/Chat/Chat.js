import React, { useContext, useEffect, useState, useRef } from 'react';
import "./Chat.css";
import axios from "axios";
import { UserContext } from '../../../App';
import moment from 'moment'
import { RoomContext } from '../ChatRoom';
import { Link } from 'react-router-dom';
import { Modal, Button } from "react-bootstrap";
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';


function Chat({ messages, roomID, paramID, hostID, participants, getRooms }) {
    const { state } = useContext(UserContext);
    const { roomState, roomDispatch } = useContext(RoomContext);
    const [input, setInput] = useState("");
    const [lastMessage, setLastMessage] = useState();
    const [show, setShow] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);


    const toggleModal = () => {
        setShow(!show);
    };

    // function uuidv4() {
    //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //         var r = Math.random() * 16 | 0, v = (c === 'x') ? r : ((r & 0x3) | 0x8);
    //         return v.toString(16);
    //     });
    // }

    // send a message when pressing Enter
    const sendMessage = async (e) => {
        e.preventDefault();
        let date = new Date().toLocaleString();
        date = moment(date).format('MM/DD/YYYY, hh:mm a');

        const myMessage = {
            //key: uuidv4(),
            roomID: roomID ? roomID : "",
            message: input,
            timestamp: date,
            sender: state._id,
        }
        if (roomID === paramID) { // direct message
            myMessage.receiverID = roomState.directReceiver;
        }
        if (input) {
            await axios.post('http://localhost:5000/messages/new', myMessage);
        }

        setInput("");
        updateDirectMessage(myMessage);
        //getRooms();
        updateMessage(myMessage);
        
    }

    // Update latest messaged of the current room to MongoDB
    const updateMessage = async (myMessage) => {
        await axios.post('http://localhost:5000/rooms/latestmessage', {
            roomID: roomID,
            latestMessage: myMessage,
        });

    }

    // update DIRECT ROOM
    const updateDirectMessage = (myMessage) => {
        axios.post('http://localhost:5000/directrooms/latestmessage', {
            roomID: roomID,
            latestMessage: myMessage,
        });
    }

    useEffect(() => {
        if (!roomID) {
            roomDispatch({
                type: "GET_ROOM_INFO",
                roomID: "",
            })
        }
    }, [roomID])

    useEffect(() => {
        if (messages !== undefined) {
            // get the latest message
            scrollToBoToom();
            setLastMessage(messages.slice(-1)[0]);
            //updateMessage();
        }
    }, [messages])
    const chatRef = useRef();
    const scrollToBoToom = () => {
        if (chatRef.current)
            chatRef.current.scrollIntoView({ behavior: "smooth" })
    }
    /****************HTML******************** */
    const headerInfo = (
        roomState ?
            roomState.roomName ?
                <>
                    <h3> {roomState.roomName} </h3>
                    <small>create by </small> <h6> {roomState.hostName} </h6>
                    {lastMessage !== undefined ? <p>Last seen at {lastMessage.timestamp}</p> : "updating.."}
                </>
                :
                <>
                    <h3> {roomState.directRoomName} </h3>
                    <p></p>
                </>
            : "");


    async function deleteRoom(roomID) {
        await axios.delete(`http://localhost:5000/rooms/delete/${roomID}`)
            .then(res => {
                //console.log('delete post', res.data);
            })
            .catch((err) => {
                console.log(err);
            })
        axios.delete(`http://localhost:5000/messages/delete/${roomID}`)
            .then(res => {
            })
            .catch((err) => {
                console.log(err);
            })
        roomDispatch({ //clear chat header
            type: "GET_ROOM_INFO",
            roomID: "",
        })
    }

    function deleteDirectRoom(roomID) {
        axios.delete(`http://localhost:5000/directrooms/delete/${roomID}`)
            .then(res => {
            })
            .catch((err) => {
                console.log(err);
            })
        axios.delete(`http://localhost:5000/messages/delete/${roomID}`)
            .then(res => {
            })
            .catch((err) => {
                console.log(err);
            })
        roomDispatch({ //clear chat header
            type: "GET_ROOM_INFO",
            roomID: "",
        })
    }

    function hideDirectRoom(roomID) {
        axios.delete(`http://localhost:5000/directrooms/delete/${roomID}`)
            .then(res => {
            })
            .catch((err) => {
                console.log(err);
            })
        roomDispatch({ //clear chat header
            type: "GET_ROOM_INFO",
            roomID: "",
        });
    }

    const onEmojiClick = async (event, emojiObject) => {
        setInput(input => [...input, emojiObject.emoji].join(''));
    }

    const userList = (
        (roomState.participants && showUserList && roomState.roomID === roomID) ?
            <div className="userList">
                {roomState.participants.map(participant => (
                    <p key={participant._id}>
                        <Link
                            style={{ textDecoration: 'none' }}
                            to={`/profile/${participant._id !== state._id ? participant._id : ""}`}>
                            <img alt="" style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
                                src={participant.pic ? participant.pic :
                                    "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"} />
                            <span >{participant.name}</span>
                        </Link>
                    </p>
                ))}
            </div> : ""
    )
    //display the chat box when a room is chosen
    const chatBox = (
        roomID ?
            roomID.length !== 0 ?
                <>
                    <div className="chatBody" onClick={() => setShowEmojiPicker(false)}>
                        {messages.map(message => (
                            <div key={message._id} className={`chatMessage ${message.sender._id === state._id && "myMessage"}`}>
                                        <Link to={`/profile/${message.sender._id !== state._id ? message.sender._id : ""}`}>
                                
                                <img alt="" style={{ width: "35px", height: "35px", borderRadius: "80px" }}
                                    src={message.sender.pic ? message.sender.pic : "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                                />
                                        </Link>

                                <div>
                                    <div className="messageHeader">
                                        <Link to={`/profile/${message.sender._id !== state._id ? message.sender._id : ""}`}>
                                            <span className="chatName"> {message.sender.name} </span>
                                        </Link>

                                        <span className="timeStamp"> {message.timestamp.substring(0, 10)} </span>
                                    </div>

                                    <div className="messageContent">
                                        <span>{message.message}</span>

                                        <small className="timeStamp"> {message.timestamp.substring(12, 20)} </small>
                                    </div>

                                </div>

                            </div>
                        ))}
                        <div ref={chatRef}></div>
                        <div>{userList}</div>
                    </div>

                    <div className="chatFooter">
                        <div className="emojiPicker">
                            {showEmojiPicker && <Picker
                                className="emoji"
                                onEmojiClick={onEmojiClick}
                                disableAutoFocus={true}
                                disableSearchBar={true}
                                skinTone={SKIN_TONE_MEDIUM_DARK}
                                groupNames={{ smileys_people: 'CSI4999 Emoji' }} />}
                        </div>
                        <i
                            className="fa fa-smile-o fa-lg"
                            aria-hidden="true" onClick={() => setShowEmojiPicker(!showEmojiPicker)}></i>

                        {/*Might add a form here */}
                        <form>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message" type="text"
                            />
                            <button type="submit" onClick={sendMessage}>Send</button>
                        </form>
                        <i className="fa fa-microphone" aria-hidden="true"></i>
                    </div>
                </> : ""
            : ""
    )


    const deleteIcon = (
        (state && state._id === hostID) ?
            <i className="fas fa-trash-alt" onClick={toggleModal}>
                <Modal show={show} onHide={toggleModal} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this room?
                        </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={toggleModal}>
                            Close
                                </Button>
                        <Button
                            variant="danger"
                            onClick={() => deleteRoom(roomID)}
                        >
                            Delete
                                </Button>
                    </Modal.Footer>
                </Modal>
            </i> :
            (roomID === paramID) ?
                <>
                    <i className="fas fa-eye-slash" onClick={() => deleteDirectRoom(roomID)}>
                        {/* <span>Hide</span> */}
                    </i>
                    <i className="fas fa-trash-alt  ml-2" onClick={toggleModal}>
                        <span>Delete</span>
                        <Modal show={show} onHide={toggleModal} animation={false}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm Deletion</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                All the message history will NOT be deleted, confirm?
                        </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={toggleModal}>
                                    Close
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => hideDirectRoom(roomID)}
                                >
                                    Delete
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </i>
                </> : ""
    )

    return (
        <div className="chat">
            <div className="chatHeader">
                {/* Avatar of the host*/}
                <img alt="" style={{ width: "50px", height: "50px", borderRadius: "80px" }}
                    src={roomState.hostPic ? roomState.hostPic :
                        roomState.directPic ? roomState.directPic :
                            "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                />
                <div className="headerInfo">
                    {headerInfo}
                </div>

                <div className="headerRight" onClick={() => setShowUserList(!showUserList)}>
                    {(roomID.length !==0 && roomID !== paramID) ? <i className="fas fa-address-card fa-lg"></i> : ""}
                    {deleteIcon}
                </div>
                <div
                    style={{ "paddingLeft": "7px" }}
                    className="fakeNavBarIcon" // replacemence for the Icon from Sidebar
                >
                    <i className="fas fa-bars fa-lg"></i>
                </div>
            </div>

            {chatBox}
        </div>
    )
}

export default Chat
