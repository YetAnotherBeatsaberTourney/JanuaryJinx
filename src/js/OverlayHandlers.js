async function getImage(platformID) {
    try {
        const response = await fetch(`https://api.beatkhana.com/api/users/${platformID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (!text) {
            new Error("Empty response body");
            return "https://static-cdn.jtvnw.net/jtv_user_pictures/b699fe0a-2e0a-48d6-b479-b7ff4e65950a-profile_image-70x70.png"; // Fallback image
        }
        const data = JSON.parse(text);
        return data.avatarUrl;
    } catch (error) {
        console.error("Failed to fetch image:", error);
        return "https://static-cdn.jtvnw.net/jtv_user_pictures/b699fe0a-2e0a-48d6-b479-b7ff4e65950a-profile_image-70x70.png"; // Fallback image
    }
}

async function getTwitchID(platformID)
{
    const response = await fetch(`https://api.beatkhana.com/api/users/${platformID}`);
    if (!response.ok) {
        new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    if (!text) {
        new Error("Empty response body");
        return "yetanotherbt"; // Fallback twitch name
    }
    const data = JSON.parse(text);    
    return data.twitchName || "yetanotherbt";
}

async function setOverlay(playerIDs, playerNames, platformIDs) {
    playerIDs = [playerIDs[0], playerIDs[1]];
    console.log("Setting overlay for players:", playerIDs, playerNames, platformIDs)

    const player1ImageElement = document.getElementById("Player1Image");
    const player1NameElement = document.getElementById("Player1Name");

    const player2ImageElement = document.getElementById("Player2Image");
    const player2NameElement = document.getElementById("Player2Name");

    const playerContainersElement = document.getElementById("PlayerContainers");
    const playerBoundsElement = document.getElementById("PlayerBounds");
    const tugOfWarElement = document.getElementById("TugOfWar");

    if (player1NameElement && player2NameElement) {
        // set player names

        player1NameElement.innerText = playerNames[0];
        player1NameElement.style.opacity = '1';

        player2NameElement.innerText = playerNames[1];
        player2NameElement.style.opacity = '1';

        window.setPlayerChannels(await getTwitchID(platformIDs[0]), await getTwitchID(platformIDs[1]));

        // set player containers
        playerContainersElement.style.opacity = '1';
        playerBoundsElement.style.opacity = '1';
        tugOfWarElement.style.opacity = '1';
    } else {
        console.error("Player name elements not found in the DOM");
    }
    // Additional code to fetch and update player images and other elements
}

export { setOverlay, getTwitchID };
