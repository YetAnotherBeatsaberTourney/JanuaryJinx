import {playerIDs, setPlayerInfo} from "./MainHandlers.js";
import {User_ClientTypes} from "moons-ta-client";
import {setOverlay} from "./OverlayHandlers";

export let playerScore = [0, 0];
export let playerMisses = [0, 0];
export let playerFC = [true, true]
export let playerAcc = [0.0, 0.0];
export let playerCombo = [0, 0];
export let playerWinScore = [0, 0];
let playerHadReplay = [false, false];
let playerReplayScores = [0, 0]; //Array for Replay Accuracy

function scoreUpdate(player, score, combo, acc, misses, reset, songPosition) {
	if (playerIDs[0] === player) {
		updatePlayerData(0, score, combo, acc, misses);
	} else if (playerIDs[1] === player) {
		updatePlayerData(1, score, combo, acc, misses);
	}

	if (player === 0 && reset === 1) {
		resetAllPlayers();
	}
}

function updatePlayerData(index, score, combo, acc, misses) {
	playerAcc[index] = (acc * 100).toFixed(2);
	playerCombo[index] = combo;
	playerScore[index] = score;
	playerMisses[index] = misses;

	updateTug();

	document.getElementById(`Player${index + 1}Combo`).textContent = playerCombo[index] + "x";
	document.getElementById(`Player${index + 1}ACC`).textContent = playerAcc[index] + "%";
	document.getElementById(`Player${index + 1}FC`).textContent = playerScore[index];

	if (playerHadReplay[index]) {
		playerReplayScores[index] = playerAcc[index];
		document.getElementById(`Player${index + 1}ReplayScore`).textContent = playerReplayScores[index] + "%";
	};

	if (misses >= 1) {
		document.getElementById(`Player${index + 1}FC`).style.color = "#d15252";
		document.getElementById(`Player${index + 1}FC`).textContent = playerMisses[index] + "x";
		playerFC[index] = false;
	} else {
		playerFC[index] = true;
		document.getElementById(`Player${index + 1}FC`).style.color = "#ffffff";
		document.getElementById(`Player${index + 1}FC`).textContent = "FC";
	}
}
function resetAllPlayers() {
	playerFC = [true, true];
	playerScore = [0, 0];
	playerAcc = [0, 0];
	playerCombo = [0, 0];
	playerWinScore = [0, 0];
	playerMisses = [0, 0];
	playerReplayScores = [0, 0];
	playerHadReplay = [false, false];

	updateTug();

	for (let i = 0; i < 2; i++) {
		document.getElementById(`Player${i + 1}FC`).style.color = "#ffffff";
		document.getElementById(`Player${i + 1}FC`).textContent = "FC";
		document.getElementById(`Player${i + 1}Combo`).textContent = "0x";
		document.getElementById(`Player${i + 1}ACC`).textContent = "0.00%";
		document.getElementById(`Player${i + 1}ReplayScore`).textContent = "0.00%"
		//document.getElementById(`Player${i + 1}ReplayScore`).style.opacity = 0; //Hide ReplayAcc by default
	}
}

function updateTug() {
	// to see the utilised formula check https://www.desmos.com/calculator/a8iurzdxea
	const diff = playerAcc[1] - playerAcc[0]; // calculate the difference in percentage
	const minDiff = 0.05;
	const base= 4.3; // logarithmic scale used.

	const logMinDiffBase = Math.log(minDiff) / Math.log(base);
	const logScale = Math.log(Math.max(minDiff,Math.abs(diff)))/Math.log(base); // apply scale
	const percentage = ((logScale-logMinDiffBase)*(1/Math.log(base)-logMinDiffBase))+Math.abs(diff*1.8); // calculate percentage (0-100)

	const leftTug = document.getElementById("LeftTug");
	const rightTug = document.getElementById("RightTug");

	if (playerAcc[0] === playerAcc[1]) {
		leftTug.style.width = "0%"
		rightTug.style.width = "0%";
		return;
	}

	if (diff < 0) {
		rightTug.style.width = "0%";
		leftTug.style.width = `${percentage}%`;
		return;
	} else if (diff > 0) {
		leftTug.style.width = "0%";
		rightTug.style.width = `${percentage}%`;
		return;
	} else {
		leftTug.style.width = "0%"
		rightTug.style.width = "0%";
		return;
	}
}

function updateScores(user, score)
{
	let scoreCountElement = [[], []]; // Initialize with empty arrays
		scoreCountElement[0] = document.getElementById("Player1Score");
		scoreCountElement[1] = document.getElementById("Player2Score");
}

function userWinScore(player)
{
	playerWinScore[player] += 1;
	updateScores(player, playerWinScore[player]);
	if(playerIDs[0] === player) {
		playerWinScore[0] += 1;
		updateScores(0, playerWinScore[0]);
	} else if(playerIDs[1] === player) {
	playerWinScore[1] += 1;
	updateScores(1, playerWinScore[1]);
	} else {
		console.error("Invalid player ID");
	}
}

function handleReplay(player)
{
	let playerReplay = [null, null];
	playerReplay[0] = document.getElementById("Player1ReplayBase");
	playerReplay[1] = document.getElementById("Player2ReplayBase");
	if(player === 0) {
		if(playerHadReplay[0] === true) {
			playerReplay[0].style.opacity = 0;
			userWinScore(1);
			playerHadReplay[0] = false;
			document.getElementById("Player1ReplayScore").textContent = playerReplayScores[0] + "%";
			document.getElementById("Player2ReplayScore").textContent = playerReplayScores[0] + "%";
			document.getElementById("Player1ReplayScore").style.opacity = 1;
			document.getElementById("Player2ReplayScore").style.opacity = 1;
		} else {
			playerReplay[0].style.opacity = 1;
			playerHadReplay[0] = true;
			playerReplayScores[0] = playerAcc[0];
			document.getElementById("Player1ReplayScore").textContent = "0.00%";
			document.getElementById("Player2ReplayScore").textContent = "0.00%";
			document.getElementById("Player1ReplayScore").style.opacity = 0;
			document.getElementById("Player2ReplayScore").style.opacity = 0;
			if (playerWinScore !== null) {
				playerWinScore[1] -= 1;
				if(playerWinScore[1] < 0) playerWinScore[1] = 0;
				updateScores(1, playerWinScore[1]);
			}
		}
	}
	else if(player === 1) {
		if(playerHadReplay[1] === true) {
			playerReplay[1].style.opacity = 1;
			userWinScore(0);
			playerHadReplay[1] = false;
			document.getElementById("Player2ReplayScore").textContent = playerReplayScores[1] + "%";
			document.getElementById("Player1ReplayScore").textContent = playerReplayScores[1] + "%";
			document.getElementById("Player1ReplayScore").style.opacity = 1;
			document.getElementById("Player2ReplayScore").style.opacity = 1;
		} else {
			playerReplay[1].style.opacity = 0;
			playerHadReplay[1] = true;
			document.getElementById("Player1ReplayScore").textContent = "0.00%";
			document.getElementById("Player2ReplayScore").textContent = "0.00%";
			document.getElementById("Player1ReplayScore").style.opacity = 0;
			document.getElementById("Player2ReplayScore").style.opacity = 0;
			if (playerWinScore !== null) {
				playerWinScore[0] -= 1;
				if(playerWinScore[0] < 0) playerWinScore[0] = 0;
				updateScores(0, playerWinScore[0]);
			}
		}
	}
	else {
		console.error("Invalid player ID");
	}
}

export { scoreUpdate, updatePlayerData, resetAllPlayers, updateTug, userWinScore, handleReplay };