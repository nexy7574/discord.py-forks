import Head from 'next/head';
import Image from 'next/image';
import { Component } from 'react';
import { render } from 'react-dom';
import styles from '../styles/Home.module.css';


class Entry extends Component {
    constructor(props) {
        super(props)
        this.item = props.item;
    }

    render() {
        return (
            <div className={styles.entry} onClick={()=>window.location.href=this.item.html_url+'#readme'}>
                <h1><a href={this.item.html_url}>{this.item.full_name}</a></h1>
                <p>Description:</p><blockquote className={styles.blockquoteDescription}>{this.item.description}</blockquote>
                <p>Stars: {this.item.stargazers_count}</p>
            </div>
        )
    }
}


class EntryContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {entries: [], page: props.page||1, something: Math.random()}
    }

    async componentDidMount() {
        let request = await fetch(
            "https://api.github.com/repos/rapptz/discord.py/forks?sort=stargazers&page="+this.state.page,
            {
                headers: {
                    accept: "application/vnd.github.v3+json",
                }
            }
        )
        if(request.status===403) {
            const diff = (request.headers["x-ratelimit-reset"] - Math.floor(Date.now()/1000))
            console.warn("Got a ratelimited response from github. Retrying in " + diff + " seconds.")
            await new Promise(resolve => setTimeout(resolve, diff));
            this.setState({something: Math.random()})  // just make this thing update
            return;
        }
        if(!request.ok) {
            console.warn("Got a bad response from github. Retrying in 5 seconds.")
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.setState({something: Math.random()})  // just make this thing update
            return;
        };
        this.last_page = this.state.page;
        let data = await request.json();
        let eligible = [];
        for(let item of data) {
            if(item.fork===false) {
                continue;
            }
            eligible.push(item)
        }
        
        this.setState({entries: eligible})
    }

    render() {
        if(this.state.entries.length===0) {
            return <div className={styles.loader}></div>
        }
        else {
            return (
                <div>
                    {this.state.entries.map(item => <Entry item={item} key={item.id}/>)}
                </div>
            )
        };
    }
}

var page = 0;

class Home extends Component {
    state = {
        page: 1,
        containers: [<EntryContainer page={1} key={1}/>]
    }

  render() {
    return (
        <div>
            <h1>Discord.py forks (as of {(new Date()).toLocaleString()})</h1>
            <div className={styles.entry} style={{borderLeftColor: "#ED4245"}}>
                <h1>Note!</h1>
                <p>This list of tools is automatically generated. No accuracy is guaranteed.</p>
            </div>
            <Entry item={{id: 400676584, full_name: "dragdev-studios/discord.py", html_url: "https://github.com/dragdev-studios/discord.py", description: "[SPONSORED] Actively maintained discord.py fork with some improvements and new features.", stargazers_count: 999}}/>
            {this.state.containers.map((x, y) => {return <div key={y}>{x}</div>})}
            <button onClick={() => {
                let element = <EntryContainer page={this.state.page+1} key={this.state.page+1}/>
                let newcontainers = this.state.containers
                newcontainers.push(element)
                this.setState({page: this.state.page+1, containers: newcontainers})
                }}>Load More Repos</button>
        </div>
    )
  }
}

export default Home;
