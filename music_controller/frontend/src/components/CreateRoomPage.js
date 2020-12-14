import React, { Component } from 'react';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Formcontrol from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import { Link } from "react-router-dom";
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { FormLabel, Typography } from '@material-ui/core';

export default class CreateRoomPage extends Component {
    defaultVotes = 2;
    constructor (props) {
        super(props);

        this.state = {
            guestCanPause : true,
            votesToSkip: this.defaultVotes,
        };

        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    }

    handleVotesChange(e) {
        this.setState({
            votesToSkip: e.target.value,
        });
    }

    handleGuestCanPauseChange(e){
        this.setState({
            guestCanPause: e.target.value === 'true' ? true: false,
        });
    }

    handleRoomButtonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        };

        fetch('/api/create-room', requestOptions).then((response) =>
            response.json()
        ).then((data)=> 
            console.log(data)
        );
        //console.log(this.state);
    }

    render() {
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component='h4' variant='h4'>
                        Create A Room
                    </Typography>
                </Grid>
                
                <Grid item xs={12} align="center">
                    <Formcontrol component='fieldset'>
                        <FormHelperText>
                            <div align='center'>
                                Guest Control of playback state
                            </div>
                        </FormHelperText>

                        <RadioGroup row defaultValue='true' onChange={this.handleGuestCanPauseChange}>
                            <FormControlLabel value='true' 
                            control={<Radio color='primary'/>} 
                            label="Play/Pause" labelPlacement="bottom" />

                            <FormControlLabel value='false' 
                            control={<Radio color='secondary'/>} 
                            label="No Control" labelPlacement="bottom" />
                        </RadioGroup>
                    </Formcontrol>
                </Grid>

                <Grid item xs={12} align="center">
                    <Formcontrol>
                        <TextField required={true} 
                        type="number"
                        onChange={this.handleVotesChange}
                        defaultValue={this.defaultVotes} 
                        inputProps={{
                            min:1,
                            style: {textAlign:'center'}
                        }} 
                        />

                        <FormHelperText>
                            <div align='center'>
                                Votes Required To Skip Song
                            </div>
                        </FormHelperText>
                    </Formcontrol>
                </Grid>

                <Grid item xs={12} align="center">
                    <Button color='secondary' variant='contained' onClick={this.handleRoomButtonPressed}>Create Rom Now!</Button>
                </Grid>

                <Grid item xs={12} align="center">
                    <Button color='primary' variant='contained' to="/" component={Link}>Return</Button>
                </Grid>
            </Grid>
        );
    }
}