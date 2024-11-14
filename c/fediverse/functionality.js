// Tutorial: https://docs.joinmastodon.org/client/intro/

// this code is (or at least ought to be) front-end design agnostic :3
// basically it just specifies IDs for stuff but other than that like, do what you want we ball

const paramSearch = new URLSearchParams(window.location.search).get("search");

const contentInsert            = document.getElementById("content-insert");

const templateStatus  = document.getElementById("template-status");
const templateAccount = document.getElementById("template-account");

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
        
        return null;
    }
}

async function insertAccount(account) {

    console.log("DEBUG_ACCT:");
    console.log(account);

    let acctEmbed = templateAccount.content.cloneNode(true);

    acctEmbed.getElementById("avatar").src                   = account.avatar;
    acctEmbed.getElementById("header").style.backgroundImage = `url("${ account.header }")`;
    acctEmbed.getElementById("display-name").innerText       = account.display_name;
    acctEmbed.getElementById("note").innerHTML               = account.note;
    acctEmbed.getElementById("followers-count").innerText    = account.followers_count;
    acctEmbed.getElementById("following-count").innerText    = account.following_count;

    let accountPart = acctEmbed.getElementById("account");
    accountPart.innerText = "@" + account.acct;
    accountPart.href      = "?search=@" + account.acct;
    
    contentInsert.appendChild(acctEmbed);
}

async function insertStatuses(statuses) {

    console.log("DEBUG_STATUSES:");
    console.log(statuses);

    if (statuses.length == 0) {
        contentInsert.innerHTML += "No statuses to display.";
        return;
    }

    for (const status of statuses) {

        // for now just skip any sensitive statuses
        if (status.sensitive) {
            continue;
        }

        // initialized the status embed
        let statusEmbed = templateStatus.content.cloneNode(true);

        let imageEmbed = "";

        for (const media of status.media_attachments) {

            if (media.type === "image")
                imageEmbed += `<img height="200" src="${ media.url }">`;
        }

        statusEmbed.getElementById("display-name").innerText = status.account.display_name;
        statusEmbed.getElementById("avatar").src             = status.account.avatar;
        statusEmbed.getElementById("content").innerHTML      = status.content;
        statusEmbed.getElementById("images").innerHTML       = imageEmbed;
        
        // `Likes: ${ status.favourites_count } / Reblogs: ${ status.reblogs_count } / Replies: ${ status.replies_count }`;

        let accountPart = statusEmbed.getElementById("account");
        accountPart.innerText = "@" + status.account.acct;
        accountPart.href      = "?search=@" + status.account.acct;
        
        contentInsert.appendChild(statusEmbed);
    }
}

async function loadFromSearch() {

    window.location.href = "?search=" + inputLoadFromSearch.value.trim().replace("#", "");
}

async function loadFromSearchTerm(term) {

    if (term.trim() === "") {
        
        loadStatusesPublic();
        return;
    }

    // reset context
    buttonLoadStatusesPublic.disabled = false;

    contentInsert.innerHTML = "Loading...";

    // decode what they're trying to search (account or hashtag)
    if (term.charAt(0) === '@') {

        // account search
        const lookupResponse = await get(`https://mastodon.social/api/v1/accounts/lookup?acct=${ term }`);
        contentInsert.innerHTML = "";
        
        if (lookupResponse) {

            const lookupJson = await lookupResponse.json();

            const acctResponse         = await get(`https://mastodon.social/api/v1/accounts/${ lookupJson.id }`);
            const acctStatusesResponse = await get(`https://mastodon.social/api/v1/accounts/${ lookupJson.id }/statuses`);
            
            if (acctResponse && acctStatusesResponse) {

                await insertAccount(await acctResponse.json());
                await insertStatuses(await acctStatusesResponse.json());
                
            } else {
                
                contentInsert.innerHTML = "There was an error.";
            }
            
        } else {
            
            contentInsert.innerHTML = "There was an error.";
        }
        
    } else {
    
        // hashtag search
        const response = await get(`https://mastodon.social/api/v1/timelines/tag/${ term.replace("#", "") }?limit=40`);
    
        if (response) {

            contentInsert.innerHTML = `<p><strong>Statuses with ${ term }</strong></p>`;
            await insertStatuses(await response.json());
            
        } else {
            
            contentInsert.innerHTML = "There was an error.";
        }
    }
}

async function loadStatusesFollowers() {
    
    // reset context
    buttonLoadStatusesPublic.disabled = false;
    buttonLoadStatusesFollowers.disabled = true;
    inputLoadFromSearch.value = "";

    if (paramSearch)
        window.history.pushState({}, "", "?");
    
    // fetch
    contentInsert.innerHTML = "Loading...";
    
    contentInsert.innerHTML = "Accounts don't exist yet. Why are you here?";
}

async function loadStatusesPublic() { // set context public?

    // reset context
    buttonLoadStatusesPublic.disabled = true;
    buttonLoadStatusesFollowers.disabled = false;
    inputLoadFromSearch.value = "";

    if (paramSearch)
        window.history.pushState({}, "", "?");

    // fetch
    contentInsert.innerHTML = "Loading...";
    const response = await get("https://mastodon.social/api/v1/timelines/public?limit=40");
    
    if (response) {

        contentInsert.innerHTML = "";
        await insertStatuses(await response.json());
        
    } else {
        
        contentInsert.innerHTML = "There was an error.";
    }
}



console.log(paramSearch);

if (paramSearch) {
    loadFromSearchTerm(paramSearch);
} else {
    loadStatusesPublic();
}
