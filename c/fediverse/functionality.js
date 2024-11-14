// Tutorial: https://docs.joinmastodon.org/client/intro/

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

    acctEmbed.getElementById("avatar").src                = account.avatar;
    acctEmbed.getElementById("header").src                = account.header;
    acctEmbed.getElementById("display-name").innerText    = account.display_name;
    acctEmbed.getElementById("account").innerText         = "@" + account.acct;
    acctEmbed.getElementById("followers-count").innerText = account.followers_count;
    acctEmbed.getElementById("following-count").innerText = account.following_count;
    
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

        let statusEmbed = templateStatus.content.cloneNode(true);

        let imageEmbed = "";

        for (const media of status.media_attachments) {

            if (media.type === "image")
                imageEmbed += `<img height="200" src="${ media.url }">`;
        }

        statusEmbed.getElementById("display-name").innerText = status.account.display_name;
        statusEmbed.getElementById("account").innerText      = "@" + status.account.acct;
        statusEmbed.getElementById("avatar").src             = status.account.avatar;
        statusEmbed.getElementById("content").innerHTML      = status.content;
        statusEmbed.getElementById("images").innerHTML       = imageEmbed;
        statusEmbed.getElementById("meta").innerHTML         = `Likes: ${ status.favourites_count } / Reblogs: ${ status.reblogs_count } / Replies: ${ status.replies_count }`;
        
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

    // decode what they're trying to search (account or hashtag)
    if (inputLoadFromSearch.value.charAt(0) === '@') {

        // account search
        const lookupResponse = await get(`https://mastodon.social/api/v1/accounts/lookup?acct=${ inputLoadFromSearch.value }`);
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
        const response = await get(`https://mastodon.social/api/v1/timelines/tag/${ inputLoadFromSearch.value.replace("#", "") }?limit=40`);
        contentInsert.innerHTML = "";
    
        if (response) {
            
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

    // fetch
    contentInsert.innerHTML = "Loading...";
    
    contentInsert.innerHTML = "Accounts don't exist yet. Why are you here?";
}

async function loadStatusesPublic() { // set context public?

    // reset context
    buttonLoadStatusesPublic.disabled = true;
    buttonLoadStatusesFollowers.disabled = false;
    inputLoadFromSearch.value = "";

    // fetch
    contentInsert.innerHTML = "Loading...";
    const response = await get("https://mastodon.social/api/v1/timelines/public?limit=40");
    contentInsert.innerHTML = "";
    
    if (response) {

        await insertStatuses(await response.json());
        
    } else {
        
        contentInsert.innerHTML = "There was an error.";
    }
}

loadStatusesPublic();
