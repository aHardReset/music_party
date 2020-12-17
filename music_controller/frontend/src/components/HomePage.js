import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import {Grid, Button, ButtonGroup, Typography} from '@material-ui/core'
 
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import RoomJoinPage from './RoomJoinPage';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null,
        };
    }

    async componentDidMount(){
        fetch('/api/user-in-room').then((response) => response.json()).then((data) => {
            this.setState({
                roomCode: data.code
            });
        });
    }

    renderHomePage(){
        return(
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" component="h3">
                        House Party!
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/join" component={Link}>Join a Room</Button>
                        <Button color="secondary" to="/create" component={Link}>Create a Room</Button>
                    </ButtonGroup> 
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" render={() => {
                        return this.state.roomCode ? (<Redirect to={`/room/${this.state.roomCode}`} />) : (this.renderHomePage())
                    }} />
                    <Route exact path='/'> {this.renderHomePage()} </Route>
                    <Route path='/join' component={RoomJoinPage} />
                    <Route exact path='/create' component={CreateRoomPage} />
                    <Route path='/room/:roomCode' component={Room} />
                </Switch>
            </Router>
        );
    }
}