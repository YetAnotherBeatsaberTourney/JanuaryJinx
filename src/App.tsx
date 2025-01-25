import React, { useState } from 'react';
import './App.css';

// import all handles
import { setPlayerInfo } from './js/MainHandlers.js';
import './js/FormatHandlers.js';
import { getMap } from './js/MapHandlers.js';
import { resetAllPlayers, scoreUpdate, userWinScore, handleReplay, playerWinScore } from "./js/UserScoringHandlers";

import { setOverlay } from './js/OverlayHandlers.js';

// TA client thingy
import { Tournament, Match, User_ClientTypes } from 'moons-ta-client';
import { useTAClient } from './useTAClient';

// Ensure Twitch is available globally
declare global {
  interface Window {
    Twitch: any;
    switchAudio: () => void;
    setPlayerChannels: (player1Channel: string, player2Channel: string) => void;
  }
}

let currentMatch: Match;

function App() {
  const handleButton = (player: any, action: any) => {
    console.log("Player " + player + " replayed");
    handleReplay(player);
  }

  let taHook = useTAClient();
  let [selectableMatches, setSelectableMatches] = useState<[string, Match][]>();

  // garbage name but I needed smt
  async function connectToMatch(myTourney: Tournament, matchID?: string) {
    let match = taHook.taClient.current!.stateManager.getMatch(myTourney.guid, matchID!)!;
    await taHook.taClient.current!.addUserToMatch(myTourney.guid, match.guid, taHook.taClient.current!.stateManager.getSelfGuid());
    // maybe error check? NAHH
    let users = taHook.taClient.current!.stateManager.getUsers(myTourney.guid)!.filter(x => match.associatedUsers.includes(x.guid) && x.clientType === User_ClientTypes.Player);
    if (users.length === 0) return;
    console.log(users);
    setPlayerInfo(users.map(x => x.guid), users.map(x => x.name));
    await setOverlay(users.map(x => x.guid), users.map(x => x.name), users.map(x => x.platformId));
    currentMatch = match;
  }
  async function addSelfToMatch(playerName: string | undefined, matchID: string | undefined) {
    console.log("Add self to match");
    const myTourney = taHook.taClient.current!.stateManager.getTournaments().find(x => x.settings?.tournamentName === "YABT Test Tourney");

    if (!myTourney) {
      console.error(`Could not find tournament with name ${'YABT Test Tourney'}`);
      return;
    }

    myTourney.matches?.forEach(match => {
      if (match.associatedUsers.includes(taHook.taClient.current!.stateManager.getSelfGuid())) {
        // remove self from match
        console.log("Removing self from match")
        taHook.taClient.current!.removeUserFromMatch(myTourney.guid, match.guid, taHook.taClient.current!.stateManager.getSelfGuid());
      }
    });

    if (!(taHook.taClient.current!.stateManager.getMatches(myTourney.guid) !== undefined && taHook.taClient.current!.stateManager.getMatches(myTourney.guid)!.length > 0)) {
      return;
    }
    if (playerName === undefined && matchID === undefined) {
      let matchID = taHook.taClient.current!.stateManager.getMatches(myTourney.guid)![0].guid;
      await connectToMatch(myTourney, matchID);
      return;
    }
    if(matchID !== undefined) {
        await connectToMatch(myTourney, matchID);
        return;
    }
    for (let i = 0; i < taHook.taClient.current!.stateManager.getMatches(myTourney.guid)!.length; i++) {
      if (taHook.taClient.current!.stateManager.getMatches(myTourney.guid)![i].associatedUsers[0].toLowerCase() === playerName || taHook.taClient.current!.stateManager.getMatches(myTourney.guid)![i].associatedUsers[1].toLowerCase() === playerName) {
        await connectToMatch(myTourney, taHook.taClient.current!.stateManager.getMatches(myTourney.guid)![i].guid);
        break;
      }
    }
  }

  async function chooseMatch() {
    console.log("Choose match");
    const myTourney = taHook.taClient.current!.stateManager.getTournaments().find(x => x.settings?.tournamentName === "YABT Test Tourney")!;

    if (!myTourney) {
      console.error(`Could not find tournament with name ${'YABT Test Tourney'}`);
      return;
    }

    const tourneyPlayers = taHook.taClient.current!.stateManager.getUsers(myTourney.guid)!;

    let selectableMatches: [string, Match][] = taHook.taClient.current!.stateManager.getMatches(myTourney.guid)!.map((match) => {
      const matchPlayers = tourneyPlayers.filter(x => x.clientType === User_ClientTypes.Player && match.associatedUsers.includes(x.guid));
      console.log(match.associatedUsers[0] + " vs " + match.associatedUsers[1]);

      return [matchPlayers[0]?.name + " vs " + matchPlayers[1]?.name, match];
    });

    setSelectableMatches(selectableMatches);
  }

  const handleScoreClick = (player: number, isAddition: boolean) => {
    const scoreElement = document.getElementById(`Player${player}Score`);
    if (scoreElement) {
      const currentScore = parseInt(scoreElement.textContent || "0");
      const newScore = isAddition ? currentScore +1 : currentScore - 1;
      scoreElement.textContent = Math.max(0, newScore).toString();
    }
  };

  React.useEffect(() => {
    const loadTwitchScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('twitch-embed-script')) {
          return;
        }
        const script = document.createElement('script');
        script.id = 'twitch-embed-script';
        script.src = "https://player.twitch.tv/js/embed/v1.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeTwitchPlayers = () => {
      const player1 = new window.Twitch.Embed("player1Video", {
        width: "120%",
        height: "120%",
        channel: "yetanotherbt",
        layout: "video",
        autoplay: true,
        muted: false,
        parent: [window.location.hostname]
      });

      const player2 = new window.Twitch.Embed("player2Video", {
        width: "120%",
        height: "120%",
        channel: "yetanotherbt",
        layout: "video",
        autoplay: true,
        muted: true,
        parent: [window.location.hostname]
      });

      // Function to switch audio between players
      function switchAudio() {
        const isPlayer1Muted = player1.getMuted();
        player1.setMuted(!isPlayer1Muted);
        player2.setMuted(isPlayer1Muted);
      }

      function setPlayerChannels(player1Channel: string, player2Channel: string) {
        player1.setChannel(player1Channel);
        player2.setChannel(player2Channel);
      }

      window.setPlayerChannels = setPlayerChannels;
      window.switchAudio = switchAudio;
    };

    loadTwitchScript().then(initializeTwitchPlayers).catch((error) => {
      console.error("Failed to load Twitch script:", error);
    });

    console.log("Subscribing to TA client events");

    const unsubscribeFromTAConnected = taHook.subscribeToTAConnected(() => {
      addSelfToMatch(undefined, undefined);
    });

    const unsubscribeFromRealtimeScores = taHook.subscribeToRealtimeScores((score) => {
      console.log(score);
      scoreUpdate(score.userGuid, score.score, score.combo, score.accuracy, score.notesMissed, 0, score.songPosition);
    });

    const unsubscribeFromSongFinished = taHook.subscribeToSongFinished((songFinished) => {
      console.log("Song finished");
      let userScores: { userGuid: string | undefined, score: number } = { userGuid: "", score: 0 };

      if (songFinished.matchId !== currentMatch?.guid) return;
      if (userScores.userGuid === "") {
        userScores = { userGuid: songFinished.player!.guid, score: songFinished.score };
      }
      // TODO: Fix user win scores
      // if (userScores.score < songFinished.score) {
      //   userWinScore(songFinished.player!.guid);
      //   userScores = { userGuid: "", score: 0 };
      // }
      // else {
      //   userWinScore(userScores.userGuid);
      //   userScores = { userGuid: "", score: 0 };
      // }
    });

    const unsubscribeFromFailedToCreateMatch = taHook.subscribeToFailedToCreateMatch(() => {
      console.log("failed to create Match");
    });

    const unsubscribeFromMatchCreated = taHook.subscribeToMatchCreated(([match, tournament]) => {
      console.log("Created match");
      if (currentMatch === undefined) {
        console.log("Match created");
        addSelfToMatch(undefined, undefined);
      }
    });

    const unsubscribeFromMatchUpdated = taHook.subscribeToMatchUpdated(([match, tournament]) => {
      console.log("Updated match");
      if (currentMatch?.guid !== match.guid) return;
      let levelID = match.selectedMap?.gameplayParameters?.beatmap?.levelId.toLowerCase().slice(13);
      let levelDiff = match.selectedMap?.gameplayParameters?.beatmap?.difficulty;
      getMap(levelID, levelDiff);
    });

    const unsubscribeFromMatchDeleted = taHook.subscribeToMatchDeleted(([match, tournament]) => {
      console.log("Deleted match");
      if (currentMatch?.guid === match?.guid) {
        // currentMatch = undefined;
        resetAllPlayers();
      }
    });

    return () => {
      console.log("Unsubscribing from TA client events");

      unsubscribeFromTAConnected();
      unsubscribeFromRealtimeScores();
      unsubscribeFromSongFinished();
      unsubscribeFromFailedToCreateMatch();
      unsubscribeFromMatchCreated();
      unsubscribeFromMatchUpdated();
      unsubscribeFromMatchDeleted();
    };
  }, []);

  return (

    <body className="BGImage">
      <div className="MainClass">
        {/*Top Bar*/}
        <div className="PlayerContainers" id="PlayerContainers">
          <div className="imageContainer">
            <img src="/images/Placeholder1.png" className="Player1Image"/>
            <img src="/images/Placeholder2.png" className="Player2Image"/>
          </div>
          <div className="StatsContainer" id="PlayerBounds">
            <img src="/images/skillreplay/ReplayBlue.svg" className="Replay ReplayBlue" id="Player1ReplayBase" 
              onClick={(e) => handleButton(0, "replay")}
              style={{ cursor: "pointer" }}/>
            <div className="ReplayScore ReplayScore1" id="Player1ReplayScore">0.00%</div>
            {/* Player 1 */}
            <div className="PlayerStats">
              <div className="TopRow1">
                <span className="FC" id="Player1FC">FC</span>
                <span className="Combo" id="Player1Combo">0x</span>
              </div>
              <span className="ACC Player1ACC" id="Player1ACC">100%</span>
            </div>
            {/* Player 2 */}
            <div className="PlayerStats">
              <div className="TopRow2">
                <span className="FC" id="Player2FC">FC</span>
                <span className="Combo" id="Player2Combo">0x</span>
              </div>
              <span className="ACC Player2ACC" id="Player2ACC">100%</span>
            </div>
            <img src="/images/skillreplay/ReplayRed.svg" className="Replay ReplayRed" id="Player2ReplayBase"
              onClick={(e) => handleButton(1, "replay")}
              style={{ cursor: "pointer" }}/>
            <div className="ReplayScore ReplayScore2" id="Player2ReplayScore">0.00%</div>
          </div>
          {/*Song Card*/}
          <div className="SongCard FadeIn" id="SongCard">
            <div className="SongBox">
              <p className="SongName" id="SongName">Very Very Really Long Song name that is...</p>
              <div className="SongInfoLeft" id="SongInfoLeft">
                <p className="SongMapper" id="SongMapper">Mapped by flitz</p>
                <p className="UploadDate" id="UploadDate">Uploaded on 2021-09-01</p>
              </div>
              <div className="SongInfoTop">
                <p className="SongArtist" id="SongArtist">Lauv</p>
                <p className="SongLength" id="SongLength">3:59</p>
              </div>
              <p className="MapKey" id="MapKey">239ba</p>
              <p className="SongBPM" id="SongBPM">123bpm</p>
              <div className="SongCover" id="SongCover"></div>
              <div className="SongBoxBG" id="SongBoxBG"></div>
            </div>
        </div>
      </div>
      {/*Tug of War*/}
      <div className="TugOfWar FadeIn" id="TugOfWar">
        <div className="LeftTugOuter">
          <div className="LeftTugInner SmoothWidth" id="LeftTug"></div>
        </div>
        <div className="RightTugOuter">
          <div className="RightTugInner SmoothWidth" id="RightTug"></div>
        </div>
      </div>
          {/* control button(s) */}
          <button
            className={"chooseMatch"}
            id={"chooseMatch"}
            onClick={() => {
              console.log("Choose match button pressed");
              chooseMatch();
            }}>
          </button>

          <span className={"buttonsChooseMatch"}>
            {selectableMatches && selectableMatches.map(([matchString, match], index) => (
              <button
                key={index}
                id={"MatchSelection"}
                onClick={() => {
                  const myTourney = taHook.taClient.current!.stateManager.getTournaments().find(x => x.settings?.tournamentName === "YABT Test Tourney");
  
                  if (!myTourney) {
                    console.error(`Could not find tournament with name ${'YABT Test Tourney'}`);
                    return;
                  }
                  addSelfToMatch(undefined, match.guid);
                  let levelID = match.selectedMap?.gameplayParameters?.beatmap?.levelId.toLowerCase().slice(13);
                  let levelDiff = match.selectedMap?.gameplayParameters?.beatmap?.difficulty;
                  getMap(levelID, levelDiff);
                  setSelectableMatches([]);
                }}
              >
                {matchString}
              </button>
            ))}
          </span>

          <button className={"MuteButton"} id={"MuteButton"} onClick={() => {
            console.log("Mute button pressed");
            window.switchAudio();
          }}></button>
        {/* Streams */}
        <div className="videoContainer">
          <div id="player1Video"></div>
          <div id="player2Video"></div>
        </div>

        {/*Player Names and Score Counter*/ }
        <div className="PlayerScores" id="PlayerScores">
          <div className="Player1Container" id="Player1Container">
            
            <div className="Player1Name" id="Player1Name">This is just A longer name </div>
            
            <div className="Player1Score" id="Player1Score"
            onClick={(e) => handleScoreClick(1, true)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleScoreClick(1, false);
            }} style={{ cursor: "pointer"}}>0</div>
          </div>
          <div className="Player2Container" id="Player2Container">
            <div className="Player2Name" id="Player2Name">Wow just Another Name</div>
            <div className="Player2Score" id="Player2Score"
            onClick={(e) => handleScoreClick(2, true)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleScoreClick(2, false);
            }} style={{ cursor: "pointer"}}>0</div>
          </div>
        </div>
      </div>
    </body>
  );
}

export default App;