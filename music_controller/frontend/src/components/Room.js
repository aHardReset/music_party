import React, {Component} from 'react';
import {Grid, Button, Typography} from '@material-ui/core';
import CreateRoomPage from './CreateRoomPage'

export default class Room extends Component {
    constructor (props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
        };
        
        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails();   
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this)
    }

    updateShowSettings(e){
        this.setState({
            showSettings: e,
        });
    }

    renderSettingsButton(){
        return(
            <Grid item xs={12} align="center">
                <Button variant='contained' color="primary" onClick={() =>
                this.updateShowSettings(true)
                }>
                    Settings
                </Button>
            </Grid>
        );
    }

    renderSettings(){
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage 
                    update={true} 
                    votesToSkip={this.state.votesToSkip} 
                    guestCanPause={this.state.guestCanPause} 
                    roomCode = {this.roomCode}
                    updateCallback={() => {}}
                    />
                </Grid>

                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>
                        Close settings
                    </Button>
                </Grid>
            </Grid>
        )
    }

    getRoomDetails() {
        return fetch("/api/get-room" + "?code=" + this.roomCode)
          .then((response) => {
            if (!response.ok) {
              this.props.leaveRoomCallback();
              this.props.history.push("/");
            }
            return response.json();
          })
          .then((data) => {
            this.setState({
              votesToSkip: data.votes_to_skip,
              guestCanPause: data.guest_can_pause,
              isHost: data.is_host,
            });
          });
      }

    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }

    render() {
        if(this.state.showSettings){
            return this.renderSettings();
        }
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Votes to skip: {this.state.votesToSkip}
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Guest Can Pause: { this.state.guestCanPause.toString() }
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Is the Host?: {this.state.isHost.toString()}
                    </Typography>
                </Grid>

                {this.state.isHost ? this.renderSettingsButton():null}

                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={this.leaveButtonPressed}>Leave Room</Button>
                </Grid>
            </Grid>
            
        );
    }
}

/*
            <div>
                <h3>{this.roomCode}</h3>
                <p>Guest Can Pause: { this.state.guestCanPause.toString() }</p>
                <p>Votes To Skip: {this.state.votesToSkip}</p>
                <p>Is the Host?: {this.state.isHost.toString()}</p>
            </div>
*/