function sanitize_prompt(prompt) {

    // remove any instances of "((()))" or "( )" and similar
    while (prompt.includes(/(\( +\))/g)) {
        
        prompt = prompt.replace(/(\( +\))/g, "");
    }

    return prompt;
}
