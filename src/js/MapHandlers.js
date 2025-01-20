import { fancyTimeFormat } from './FormatHandlers.js';
export let songData = ["",0];

async function getMap(LevelId, LevelDiff) {
	let diffText, diffColor, diffBG, diffBorder;

	switch (LevelDiff) {
		case 0:
			diffText = "Easy";
			diffColor = "#008055";
			diffBG = "/images/Songcards/Normal/EasyBG.svg";
			diffBorder = "/images/Songcards/Normal/Easy.svg";
			break;
		case 1:
			diffText = "Normal";
			diffColor = "#1268A1";
			diffBG = "/images/Songcards/Normal/NormalBG.svg";
			diffBorder = "/images/Songcards/Normal/Normal.svg";
			break;
		case 2:
			diffText = "Hard";
			diffColor = "#BD5500";
			diffBG = "/images/Songcards/Normal/HardBG.svg";
			diffBorder = "/images/Songcards/Normal/Hard.svg";
			break;
		case 3:
			diffText = "Expert";
			diffColor = "#B52A1C";
			diffBG = "/images/Songcards/Normal/ExpertBG.svg";
			diffBorder = "/images/Songcards/Normal/Expert.svg";
			break;
		case 4:
			diffText = "Expert+";
			diffColor = "#454088";
			diffBG = "/images/Songcards/Normal/Expert+BG.svg";
			diffBorder = "/images/Songcards/Normal/Expert+.svg";
			break;
	}
	if (songData[0] !== LevelId) {
		songData[0] = LevelId;
		songData[1] = LevelDiff;

		document.getElementById("SongCard").style.opacity = "0";
		try {
			const response = await fetch(`https://api.beatsaver.com/maps/hash/${LevelId}`, {
				headers: {
					'Access-Control-Request-Headers': 'x-requested-with'
				}
			});
			const data = await response.json();

			if (!LevelId) {
				console.error('Invalid LevelId:', LevelId);
				return;
			}
			setTimeout(function () {
				document.getElementById("SongCover").style.background = `url('https://eu.cdn.beatsaver.com/${LevelId.toLowerCase()}.jpg') 50% 50% / cover`;
				document.getElementById("SongCover").style.left = "122px";
				document.getElementById("SongBoxBG").style.background = `url('${diffBorder}') no-repeat center center / contain`;
				document.getElementById("SongBoxBG").style.left = "0px";
				document.getElementById("SongCard").style.background = `url('${diffBG}') no-repeat center center / contain`;
				document.getElementById("SongArtist").innerText = data.metadata.levelAuthorName.replaceAll('/n', '').replaceAll('/r', '');
				document.getElementById("SongName").innerText = data.metadata.songName.replaceAll('/n', '').replaceAll('/r', '');
				document.getElementById("SongMapper").innerText = data.metadata.songAuthorName.replaceAll('/n', '').replaceAll('/r', '');
				document.getElementById("MapKey").innerText = data.id.replaceAll('/n', '').replaceAll('/r', '');
				document.getElementById("SongBPM").innerText = data.metadata.bpm.replaceAll('/n', '').replaceAll('/r', '') + "bpm";
				document.getElementById("SongLength").innerText = fancyTimeFormat(data.metadata.duration).replaceAll('/n', '').replaceAll('/r', '');
				document.getElementById("UploadDate").innerText = "Uploaded at " + data.uploaded.replaceAll('/n', '').replaceAll('/r', '');
				setTimeout(function () {
					document.getElementById("SongCard").style.opacity = "1";
				}, 500);
			}, 500);
		} catch (error) {
			console.error('Error fetching map data:', error);
		}
	} else if (songData[0] === LevelId && songData[1] !== LevelDiff) {
		songData[1] = LevelDiff;
		document.getElementById("DiffBox").style.opacity = "0";
		document.getElementById("ModifiersBox").style.opacity = "0";
		document.getElementById("PickedBy").style.opacity = "0";

		setTimeout(function () {
			document.getElementById("DiffBox").style.background = diffColor;
			document.getElementById("DiffName").innerHTML = diffText;
			document.getElementById("DiffBox").style.opacity = "1";
			document.getElementById("PickedBy").style.opacity = "1";
		}, 1000);
	}
}

export { getMap };