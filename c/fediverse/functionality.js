// Tutorial: https://docs.joinmastodon.org/client/intro/

const contentInsert            = document.getElementById("content-insert");

const buttonLoadStatusesPublic    = document.getElementById("button-load-statuses-public");
const buttonLoadStatusesFollowers = document.getElementById("button-load-statuses-followers");
const inputLoadFromSearch         = document.getElementById("input-load-from-search");

buttonLoadStatusesPublic.onclick    = loadStatusesPublic;
buttonLoadStatusesFollowers.onclick = loadStatusesFollowers;
inputLoadFromSearch.onchange        = loadFromSearch;

async function fetchAndInsertStatuses(URL) {

    const response = await fetch(URL,
        {
            method: "GET",
            headers: {
                "content-type": "application/json"
            }
        }
    );

    if (response.status != 200) {
        alert("Error " + response.status);
        return;
    }

    const statuses = await response.json();

    console.log(statuses);

    for (const status of statuses) {

        let imageEmbed = "";

        for (const media of status.media_attachments) {

            if (media.type === "image")
                imageEmbed += `<img height="200" src="${ media.url }">`;
        }

        contentInsert.innerHTML += `
            <div style="margin: 1em 0; padding: 1em; border: 1px solid black; border-radius: 8px;">
                <strong><a href="${ status.account.url }">${ status.account.username }</a></strong>
                <br>
                ${ status.content }
                <br>
                ${ imageEmbed }
                <br>
                Likes: ${ status.favourites_count } / Reblogs: ${ status.reblogs_count } / Replies: ${ status.replies_count }
            </div>
        `;
    }
}

async function loadFromSearch() {

    // reset context
    buttonLoadStatusesPublic.disabled = false;

    contentInsert.innerHTML = "Loading...";

    // decode what they're trying to search (user or hashtag)
    
    // hashtag search
    fetchAndInsertStatuses(`https://mastodon.social/api/v1/timelines/tag/${ inputLoadFromSearch.value }?limit=40`);

    // user search (idk how I should do this actually)
    // https://mastodon.social/api/v1/accounts/lookup?acct=johnnnnn
    // https://mastodon.social/api/v1/accounts/113480132212449271/statuses
}

async function loadStatusesFollowers() {
    
    // reset context
    buttonLoadStatusesPublic.disabled = false;
    buttonLoadStatusesFollowers.disabled = true;
    inputLoadFromSearch.value = "";

    contentInsert.innerHTML = "Loading...";

    // fetch
}

async function loadStatusesPublic() {

    // reset context
    buttonLoadStatusesPublic.disabled = true;
    buttonLoadStatusesFollowers.disabled = false;
    inputLoadFromSearch.value = "";

    contentInsert.innerHTML = "Loading...";

    // fetch
    fetchAndInsertStatuses("https://mastodon.social/api/v1/timelines/public?limit=40");
}

loadStatusesPublic();
