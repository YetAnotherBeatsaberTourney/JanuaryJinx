import { fancyTimeFormat } from './FormatHandlers.js';
export let songData = ["",0];

async function getMap(LevelId, LevelDiff) {

	switch (LevelDiff) {
		case 0:
			var diffText = "Easy";
			var diffColor = "#008055";
			break;
		case 1:
			var diffText = "Normal";
			var diffColor = "#1268A1";
			break;
		case 2:
			var diffText = "Hard";
			var diffColor = "#BD5500";
			break;
		case 3:
			var diffText = "Expert";
			var diffColor = "#B52A1C";
			break;
		case 4:
			var diffText = "Expert+";
			var diffColor = "#454088";
			break;
	}
	if (songData[0] != LevelId) {
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
				document.getElementById("SongBoxBG").style.background = `url('https://eu.cdn.beatsaver.com/${LevelId.toLowerCase()}.jpg') 50% 50% / cover`;
				document.getElementById("SongArtist").innerText = data.metadata.levelAuthorName.replaceAll('\n', '').replaceAll('\r', '');
				document.getElementById("SongName").innerText = data.metadata.songName.replaceAll('\n', '').replaceAll('\r', '');
				document.getElementById("SongMapper").innerText = data.metadata.songAuthorName.replaceAll('\n', '').replaceAll('\r', '');
				document.getElementById("DiffName").innerHTML = diffText.replaceAll('\n', '').replaceAll('\r', '');
				document.getElementById("SongLength").innerText = fancyTimeFormat(data.metadata.duration).replaceAll('\n', '').replaceAll('\r', '');
				document.getElementById("UploadDate").innerText = "Uploaded at " + data.uploaded.replaceAll('\n', '').replaceAll('\r', '');
				setTimeout(function () {
					document.getElementById("SongCard").style.opacity = "1";
				}, 500);
			}, 500);
		} catch (error) {
			console.error(error);
		}
	} else if (songData[0] == LevelId && songData[1] != LevelDiff) {
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