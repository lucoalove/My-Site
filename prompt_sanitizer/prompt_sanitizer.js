// I love you, https://regexr.com/ <3

// Removes sequences of more than two linebreaks
// Removes spaces before parenthesis and commas
// Adds a space after commas

function sanitize_prompt(prompt) {

    // collapse concurrent spaces
    prompt = prompt.replace(/ +/g, " ");

    // remove any instances of "((()))" or "( )" and similar
    while (prompt.match(/(\( *\))/g) != null) {
        
        prompt = prompt.replace(/(\( *\))/g, "");
    }

    // replace concurrent commas (even separated by spaces) with a single comma followed by (an arbitrary amount of) spaces
    prompt = prompt.replace(/ +,/g, ",");   // remove spaces preceding commas
    prompt = prompt.replace(/,+/g, ",");    // collapse sequences of commas to one comma

    // remove commas preceding a closing parenthesis (even when separated by spaces)
    prompt = prompt.replace(/, *\)/g, ")");

    // ...and also when following an opening parenthesis
    prompt = prompt.replace(/\( *,/g, "(");

    // normalize to one space after each comma
    prompt = prompt.replace(/, */g, ", ");

    // remove spaces between parenthesis and the text they contain
    prompt = prompt.replace(/ +\)/g, ")");
    prompt = prompt.replace(/\( +/g, "(");

    return prompt;
}
