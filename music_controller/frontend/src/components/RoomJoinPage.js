import React, { Component } from 'react';
import {TextField, Button, Grid, Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';

export default class RoomJoinPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            roomCode: "",
            error: "",
        };
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.roomBottonPressed = this.roomBottonPressed.bind(this);
    }

    handleTextFieldChange(e){
        this.setState({
            roomCode: e.target.value
        });
    }

    roomBottonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                code: this.state.roomCode
            })
        };

        fetch('/api/join-room', requestOptions).then((response) => {
            if (response.ok) {
                this.props.history.push(`/room/${this.state.roomCode}`)
            }
            else {
                this.setState({error: "Room Not found"})
            }
        }).catch((error)=>{
            console.log(error)
        });
    }

    render() {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant='h4' component='h4'>
                        Join A Room!
                    </Typography>
                </Grid>

                <Grid item xs={12} align="center">
                    <TextField 
                        error={ this.state.error }
                        label="Code"
                        placeholder="Enter a room code"
                        value={ this.state.roomCode }
                        helperText={ this.state.error }
                        variant="outlined"
                        onChange={ this.handleTextFieldChange }
                    />
                </Grid>

                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" to="/" component={Link}> Back </Button>
                </Grid>
                
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={this.roomBottonPressed}>Enter Room</Button>
                </Grid>
            </Grid>
        );
    }
}