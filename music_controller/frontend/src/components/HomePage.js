import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
 
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import RoomJoinPage from './RoomJoinPage';

export default class HomePage extends Component {
    constructor(props) {
    super(props);
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path='/'> <p>HomePage!</p></Route>
                    <Route path='/join' component={RoomJoinPage} />
                    <Route exact path='/create' component={CreateRoomPage} />
                    <Route path='/room/:roomCode' component={Room} />
                </Switch>
            </Router>
        );
    }
}