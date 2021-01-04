import React, { Component } from "react";
import {Helmet} from 'react-helmet';
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {
    constructor(props){
        super(props);
        this.pauseSong = this.pauseSong.bind();
        this.playSong = this.playSong.bind(this);
    }


    pauseSong() {
        const requestOptions = {
            method : "PUT",
            headers: {"Content-Type": "application.json"}
        };

        fetch("/spotify/pause", requestOptions);
    }

    playSong() {
        const requestOptions = {
            method : "PUT",
            headers: {"Content-Type": "application.json"}
        };

        fetch("/spotify/play", requestOptions);
    }

    render(){
        const songProgress = (this.props.time / this.props.duration) * 100;
        //download the logo and do an actualization. Evade Spotify logo until we read the docs
        const defaultImageUrl = "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png";
        return(
        <Card>
            <Grid container alignItems='center'>
                <Grid item align='center' xs={4}>
                    <img src={this.props.image_url ? this.props.image_url : defaultImageUrl} width="100%" height="100%"></img>
                </Grid>

                <Grid item align='center' xs={8}>
                    <Typography component='h5' variant='h5'>
                        {this.props.title ? this.props.title : "Waiting For A Song"}
                    </Typography>

                    <Typography color='textSecondary' variant='subtitle1'>
                        {this.props.artist ? this.props.artist : "Start a song on spotify"}
                    </Typography>

                    <div>
                        <IconButton onClick={() => {this.props.is_playing ? this.pauseSong() : this.playSong()}}>
                            {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon/>}
                        </IconButton>

                        <IconButton>
                            <SkipNextIcon/>
                        </IconButton>
                    </div>

                </Grid>

            </Grid>

            <LinearProgress variant="determinate" value={songProgress}/>
            <Helmet titleTemplate={this.props.title ? this.props.title + ' - Music Party' : 'Music Party'} defer={false}>
                <title>{this.props.title}</title>
                <style>
                    {this.props.section ? 'body { background-color:' + this.props.section.color +'; }'  : 'body { background-color: #4169E1;' }
                </style>
            </Helmet>
            
            
        </Card>
        )}
}

/*
<Helmet>
                <style>{'body { background-color:'+ +' red; }'}</style>
            </Helmet>
            */