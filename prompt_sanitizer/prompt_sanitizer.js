// I love you, https://regexr.com/ <3

function sanitize_prompt(prompt) {

    // collapse concurrent spaces
    prompt = prompt.replace(/ +/g, " ");

    // remove any instances of "((()))" or "( )" and similar
    while (prompt.match(/(\( +\))/g) != null) {
        
        prompt = prompt.replace(/(\( +\))/g, "");
    }

    // replace concurrent commas (even separated by spaces) with a single comma followed by (an arbitrary amount of) spaces
    prompt = prompt.replace(/ +,/g, ",");   // remove spaces preceding commas
    prompt = prompt.replace(/,+/g, ",");    // collapse sequences of commas to one comma

    return prompt;
}
