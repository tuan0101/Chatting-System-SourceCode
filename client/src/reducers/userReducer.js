//export const initialState = {messageNotif: 0};
export const initialState = null;

export const reducer = (state, action) => {

    if(action.type === "USER") {
        return action.payload;
    }

    if(action.type === "CLEAR"){
        return null;
    }

    if(action.type === "UPDATE"){
        return {
            ...state,
            followers:action.payload.followers,
            following:action.payload.following,
        }
    }

    if(action.type === "UPDATEFAV"){
        return {
            ...state,
            favorites:action.payload.favorites,
            favoring:action.payload.favoring
        }
    }

    if(action.type==="UPDATE_PIC"){
        return {
            ...state,
            pic:action.payload.pic
        }
    }

    if(action.type==="UPDATE_ABOUT"){
        return {
            ...state,
            about:action.payload.about
        }
    }

    if(action.type==="UPDATE_SCHOOL"){
        return {
            ...state,
            school:action.payload.school
        }
    }

    if(action.type==="UPDATE_PASSWORD"){
        return {
            ...state,
            password:action.payload.password
        }
    }

    if(action.type==="GET_DIRECT_ROOM_INFO"){
        return {
            ...state,
            directRoomID: action.directRoomID,
            directParticipants: action.directParticipants,
            directReceiver: action.directReceiver,
        }
    }

    if(action.type==="GET_MESSAGE_NOTIFICATION"){
        return {
            ...state,
            messageNotif: action.messageNotif,
            clearNotif: action.clearNotif,
        }
    }

    if(action.type==="GET_NOTIFICATION"){
        return {
            ...state,
            notification: action.notification,
        }
    }
    if(action.type==="isVerified"){
        return {
            ...state,
            confirmed: action.verified,
        }
    }
    return state;
}