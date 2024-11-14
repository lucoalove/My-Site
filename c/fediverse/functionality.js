// Tutorial: https://docs.joinmastodon.org/client/intro/

const contentInsert            = document.getElementById("content-insert");

const templateStatus = document.getElementById("template-status");

const buttonLoadStatusesPublic    = document.getElementById("button-load-statuses-public");
const buttonLoadStatusesFollowers = document.getElementById("button-load-statuses-followers");
const inputLoadFromSearch         = document.getElementById("input-load-from-search");

buttonLoadStatusesPublic.onclick    = loadStatusesPublic;
buttonLoadStatusesFollowers.onclick = loadStatusesFollowers;
inputLoadFromSearch.onchange        = loadFromSearch;

async function get(URL) {

    const response = await fetch(URL,
        {
            method: "GET",
            headers: {
                "content-type": "application/json"
            }
        }
    );

    if (response.status == 200) {
        
        return response;
    } else {
        alert("Error " + response.status);
        return null;
    }
}

async function insertStatuses(statuses) {

    console.log(statuses);

    contentInsert.innerHTML = "";

    for (const status of statuses) {

        let statusEmbed = templateStatus.content.cloneNode(true);

        let imageEmbed = "";

        for (const media of status.media_attachments) {

            if (media.type === "image")
                imageEmbed += `<img height="200" src="${ media.url }">`;
        }

        statusEmbed.getElementById("username").innerText = status.account.username;
        statusEmbed.getElementById("content").innerHTML  = status.content;
        statusEmbed.getElementById("images").innerHTML   = imageEmbed;
        statusEmbed.getElementById("meta").innerHTML     = `Likes: ${ status.favourites_count } / Reblogs: ${ status.reblogs_count } / Replies: ${ status.replies_count }`;
        
        contentInsert.appendChild(statusEmbed);
    }
}

async function loadFromSearch() {

    if (inputLoadFromSearch.value.trim() === "") {
        
        loadStatusesPublic();
        return;
    }

    // reset context
    buttonLoadStatusesPublic.disabled = false;

    contentInsert.innerHTML = "Loading...";

    // decode what they're trying to search (user or hashtag)
    if (inputLoadFromSearch.value.charAt(0) === '@') {

        // user search
        const lookupResponse = await get(`https://mastodon.social/api/v1/accounts/lookup?acct=${ inputLoadFromSearch.value }`);

        if (lookupResponse) {

            const userResponse         = await get(`https://mastodon.social/api/v1/accounts/${ (await lookupResponse.json()).id }`);
            const userStatusesResponse = await get(`https://mastodon.social/api/v1/accounts/${ (await lookupResponse.json()).id }/statuses`);

            console.log(userResponse);
            
            if (userStatusesResponse)
                await insertStatuses(await userStatusesResponse.json());
        }
        
    } else {
    
        // hashtag search
        const response = await get(`https://mastodon.social/api/v1/timelines/tag/${ inputLoadFromSearch.value }?limit=40`);
    
        if (response)
            await insertStatuses(await response.json());
    }
}

async function loadStatusesFollowers() {
    
    // reset context
    buttonLoadStatusesPublic.disabled = false;
    buttonLoadStatusesFollowers.disabled = true;
    inputLoadFromSearch.value = "";

    contentInsert.innerHTML = "Loading...";

    // fetch
    contentInsert.innerHTML = "Accounts don't exist yet. Why are you here?";
}

async function loadStatusesPublic() { // set context public?

    // reset context
    buttonLoadStatusesPublic.disabled = true;
    buttonLoadStatusesFollowers.disabled = false;
    inputLoadFromSearch.value = "";

    contentInsert.innerHTML = "Loading...";

    // fetch
    const response = await get("https://mastodon.social/api/v1/timelines/public?limit=40");

    if (response) {

        await insertStatuses(await response.json());
    }
}

loadStatusesPublic();
