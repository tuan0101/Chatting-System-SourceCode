import React, { useContext, useEffect, useState, useRef } from 'react';
import "./SchoolChat.css";
import axios from "axios";
import { UserContext } from '../../../App';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';


function SchoolChat({ messages, roomID }) {
    const [input, setInput] = useState("");
    const { state } = useContext(UserContext);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        await axios.post('http://localhost:5000/messages/new', myMessage);

        setInput("");
    }

    useEffect(() => {
        if (messages !== undefined) {
            scrollToBoToom();
        }
    }, [messages])

    const chatRef = useRef();
    const scrollToBoToom = () => {
        if (chatRef.current)
            chatRef.current.scrollIntoView({ behavior: "smooth" })
    }

    const onEmojiClick = (event, emojiObject) => {
        setInput(input => [...input, emojiObject.emoji].join(''));
    }

    /****************HTML******************** */
    const chatBox = (
        roomID ?
            roomID.length !== 0 ?
                <>
                    <div className="schoolChatBody" onClick={() => setShowEmojiPicker(false)}>

                        {messages.map(message => (
                            <div key={message._id} className={`chatMessage ${message.sender._id === state._id && "myMessage"}`}>
                                <img alt="" style={{ width: "35px", height: "35px", borderRadius: "80px" }}
                                    src={message.sender.pic ? message.sender.pic : "https://www.shareicon.net/data/2017/05/24/886412_user_512x512.png"}
                                />
                                <div>
                                    <div className="messageHeader">
                                        <Link to={`/profile/${message.sender._id !== state._id ? message.sender._id : ""}`}>
                                            <span className="chatName"> {message.sender.name} </span>
                                        </Link>
                                        {/* show date */}
                                        <span className="timeStamp"> {message.timestamp.substring(0, 10)} </span>
                                    </div>
                                    <div className="messageContent">
                                        <span>{message.message}</span>
                                        {/* show hh:mm */}
                                        <small className="timeStamp"> {message.timestamp.substring(12, 20)} </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatRef}></div>
                    </div>
                    <div className="chatFooter chatSchoolFooter">
                        <div className="emojiPicker">
                            {showEmojiPicker && <Picker
                                className="emoji"
                                onEmojiClick={onEmojiClick}
                                disableAutoFocus={true}
                                disableSearchBar={true}
                                skinTone={SKIN_TONE_MEDIUM_DARK}
                                groupNames={{ smileys_people: 'CSI4999 Emoji' }} />}
                        </div>
                        <i className="fa fa-smile-o fa-lg"
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


    return (
        <div className="schoolChat">
            {chatBox}
        </div>
    )
}

export default SchoolChat
