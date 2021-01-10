import React, { useEffect, createContext, useReducer, useContext } from "react";
import NavBar from "./components/Navbar/Navbar";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import Home from "./components/screens/Home";
import Signin from "./components/Signin/Signin";
import Profile from "./components/Profile/Profile";
import UserProfile from "./components/Profile/UserProfile";
import Signup from "./components/Signup/Signup";
import StandAlonePost from "./components/Post/StandAlonePost";
import CreatePost from "./components/Createpost/CreatePost";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import FollowingUserPosts from "./components/screens/FollowingUserPosts";
import Feed from "./components/Feed/Feed";
import FavoritesUserPosts from './components/screens/FavoritesUserPosts';
import SchoolTime from './components/SchoolTime/SchoolTime';
import Notifications from './components/Notifications/Notifications.js';
import { Col, Row } from "react-bootstrap";
import Reset from './components/Reset/Reset'
import NewPassword from './components/NewPassword/NewPassword';
import { reducer, initialState } from './reducers/userReducer';
import SideBar from "./components/ChatRoom/SideBar/SideBar";
import Confirm from "./components/Confirm/Confirm";
import Verify from "./components/Verify/Verify";

// create context
export const UserContext = createContext();

export const Routing = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    //if user is present (user date) in the local storage, then redirect to home page
    if (user) {
      dispatch({ type: "USER", payload: user })
      // history.push('/'); No need for this because users can navigate to any pages if logged in
    }
    //redirect users to sign in
    else {
      if (history.location.pathname.startsWith('/Reset')) {
      }
      else if (history.location.pathname.startsWith('/Confirm')) {
      }
      else if (history.location.pathname.startsWith('/Verify')) {
      }
      else {
        history.push('/signin')
        }
      }
  }, [])

  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/createpost" component={CreatePost} />
      <Route exact path="/profile" component={Profile} />
      <Route path="/profile/:userid" component={UserProfile} />
      <Route path="/post/:postid" component={StandAlonePost} />
      <Route path="/profile" component={Profile} />
      <Route exact path="/chatroom" component={ChatRoom} />
      <Route path="/chatroom/direct/:paramID" component={ChatRoom} />
      <Route path="/chatroom" component={ChatRoom} />
      <Route path="/chatroom/direct" component={SideBar} />
      <Route path="/myfolloweringpost" component={FollowingUserPosts} />
      <Route path="/feed" component={Feed} />
      <Route path="/myfavorites" component={FavoritesUserPosts} />
      <Route path="/schooltime" component={SchoolTime} />
      <Route path="/notifications" component={Notifications} />
      <Route exact path="/Reset" component={Reset} />
      <Route path="/Reset/:token" component={NewPassword} />
      <Route path="/Confirm/:token1" component={Confirm} />
      <Route exact path="/Verify" component={Verify} />
    </Switch>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // remove find do mode is deprecated in strict mode error
    <React.StrictMode>
      <UserContext.Provider value={{ state, dispatch }}>
        <div className="app-layout p-0 m-0">
          <Row className="">
            <Col md={12} sm={12} lg={12}>
              <Router>
                <NavBar />
                <Routing />
              </Router>
            </Col>
          </Row>
        </div>
      </UserContext.Provider>
    </React.StrictMode>
  );
}

export default App;